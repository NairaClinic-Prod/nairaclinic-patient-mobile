import { useHomeProfile } from '@/api/home';
import {
  bookAndPay,
  useLabQuote,
  useLabSlots,
  type LabBooking,
  type LabCollection,
  type LabOption,
  type LabQuoteInput,
  type ResultDelivery,
} from '@/api/labs';
import { Choosable } from '@/components/shared/choosable';
import { PressableScale } from '@/components/shared/pressable-scale';
import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';
import { ScheduleSteps } from '@/features/booking/components/schedule-steps';
import type { DayOfSlots } from '@/features/booking/types';
import { formatNaira } from '@/features/orders/utils';
import { validatePhone } from '@/lib/validation';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { LocationDraft } from '../types';

const DAYS_AHEAD = 14;
const DAY_MS = 86_400_000;

// The Lagos calendar day, as the server expects it (YYYY-MM-DD).
const dayKey = (date: Date) => new Date(date.getTime() + 3_600_000).toISOString().slice(0, 10);

type CheckoutInput = {
  // Null until a laboratory is chosen; the step only shows once there is one.
  lab: LabOption | null;
  collection: LabCollection;
  location: LocationDraft;
  // Set when booking a price a laboratory replied with.
  responseId?: string;
};

export type LabCheckout = ReturnType<typeof useLabCheckout>;

// Everything the checkout step needs: what the server says it costs, the times it can offer, what the
// patient has picked, and what is still missing. The footer button uses the same state.
export function useLabCheckout({ lab, collection: wanted, location, responseId }: CheckoutInput) {
  const profile = useHomeProfile();
  const [collection, setCollection] = React.useState<LabCollection>(wanted);
  const [resultDelivery, setResultDelivery] = React.useState<ResultDelivery | null>(null);
  const [date, setDate] = React.useState(() => dayKey(new Date()));
  const [slot, setSlot] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState(location.address);
  const [area, setArea] = React.useState('');
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [started, setStarted] = React.useState<{ key: string; booking: LabBooking } | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const row = profile.data;
    if (!row) return;
    const full = [row.patientProfile?.firstName, row.patientProfile?.lastName]
      .filter(Boolean)
      .join(' ');
    setName((current) => current || full);
    setPhone((current) => current || row.user.phone || '');
  }, [profile.data]);

  // A new laboratory starts the choices over.
  const labId = lab?.id ?? null;
  React.useEffect(() => {
    setCollection(wanted);
    setResultDelivery(null);
    setSlot(null);
    setDate(dayKey(new Date()));
    setAddress(location.address);
    setDeliveryAddress('');
    setStarted(null);
    const guess = location.lga || location.city;
    setArea(lab?.homeAreas.find((entry) => entry.toLowerCase() === guess.toLowerCase()) ?? '');
    // Only a different laboratory restarts the step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId]);

  const input: LabQuoteInput | null = React.useMemo(
    () =>
      lab
        ? {
            branchId: lab.id,
            collection,
            ...(resultDelivery ? { resultDelivery } : {}),
            ...(responseId
              ? { responseId }
              : { testIds: lab.matched.flatMap((entry) => (entry.testId ? [entry.testId] : [])) }),
          }
        : null,
    [lab, collection, resultDelivery, responseId]
  );
  const quote = useLabQuote(input);
  const priced = quote.data ?? null;
  const slots = useLabSlots(labId, date, collection);

  // Keep to what the server allows for these tests.
  React.useEffect(() => {
    if (!priced) return;
    const [first] = priced.allowedCollectionOptions;
    if (first && !priced.allowedCollectionOptions.includes(collection)) setCollection(first);
    if (resultDelivery && !priced.allowedResultDelivery.includes(resultDelivery)) {
      setResultDelivery(null);
    }
  }, [priced, collection, resultDelivery]);

  React.useEffect(() => setSlot(null), [date, collection]);

  // The hard copy goes to the home address unless the patient changes it.
  React.useEffect(() => {
    if (resultDelivery !== 'delivery') return;
    setDeliveryAddress(
      (current) =>
        current ||
        (collection === 'home' && address
          ? `${address}${area ? `, ${area}` : ''}`
          : location.address)
    );
  }, [resultDelivery, collection, address, area, location.address]);

  const days = React.useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, index) =>
        dayKey(new Date(Date.now() + index * DAY_MS))
      ),
    []
  );

  const phoneCheck = validatePhone(phone);
  const problems: string[] = [];
  if (!priced) problems.push('Prices');
  if (!slot) problems.push(collection === 'home' ? 'An arrival window' : 'An appointment time');
  if (!resultDelivery) problems.push('How you get your results');
  if (name.trim().length < 2) problems.push('Patient name');
  if (!phoneCheck.valid) problems.push('A valid phone number');
  if (collection === 'home' && address.trim().length < 5) problems.push('Collection address');
  if (collection === 'home' && lab?.homeAreas.length && !area) problems.push('Collection area');
  if (resultDelivery === 'delivery' && deliveryAddress.trim().length < 5) {
    problems.push('Delivery address');
  }

  async function submit(onReturn?: () => void) {
    if (!input || !slot || !resultDelivery || problems.length)
      throw new Error(`Still needed: ${problems.join(', ')}.`);
    const body = {
      ...input,
      collection,
      resultDelivery,
      slotStart: slot,
      contactName: name.trim(),
      contactPhone: phoneCheck.formatted,
      ...(collection === 'home' ? { address: address.trim(), ...(area ? { area } : {}) } : {}),
      ...(resultDelivery === 'delivery' ? { deliveryAddress: deliveryAddress.trim() } : {}),
    };
    const key = JSON.stringify(body);
    setBusy(true);
    try {
      // A booking already started with these same choices is paid again, never started twice.
      const again = started?.key === key ? started.booking : null;
      const result = await bookAndPay(body, again, onReturn);
      setStarted({ key, booking: result.booking });
      return result;
    } finally {
      setBusy(false);
    }
  }

  return {
    lab,
    collection,
    setCollection,
    resultDelivery,
    setResultDelivery,
    date,
    setDate,
    days,
    slot,
    setSlot,
    slots,
    quote,
    priced,
    name,
    setName,
    phone,
    setPhone,
    address,
    setAddress,
    area,
    setArea,
    deliveryAddress,
    setDeliveryAddress,
    problems,
    busy,
    submit,
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text className="text-[15px] font-extrabold">{title}</Text>
      {children}
    </View>
  );
}

function Chip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      scaleTo={0.95}
      role="radio"
      disabled={disabled}
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      className={cn(
        'rounded-full border px-4 py-2.5',
        selected ? 'border-primary bg-primary' : 'border-border bg-card',
        disabled && 'opacity-40'
      )}>
      <Text
        className={cn(
          'text-[13px] font-semibold',
          selected ? 'text-primary-foreground' : 'text-foreground'
        )}>
        {label}
      </Text>
    </PressableScale>
  );
}

function Money({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View className="flex-row items-baseline justify-between gap-3">
      <Text className={cn(strong ? 'text-base font-bold' : 'text-[13px] text-muted-foreground')}>
        {label}
      </Text>
      <Text className={cn(strong ? 'text-xl font-extrabold' : 'text-[13px] font-semibold')}>
        {formatNaira(value)}
      </Text>
    </View>
  );
}

export function LabCheckoutStep({ checkout }: { checkout: LabCheckout }) {
  const { priced, lab, collection, resultDelivery } = checkout;
  if (!lab) return null;

  if (checkout.quote.isError) {
    return (
      <View className="rounded-2xl bg-muted px-4 py-5">
        <Text className="text-center text-[13px] leading-5 text-muted-foreground">
          {checkout.quote.error instanceof Error
            ? checkout.quote.error.message
            : "We couldn't price these tests. Go back and try again."}
        </Text>
      </View>
    );
  }
  // Only the very first price shows a full-screen spinner. Later re-prices (after changing the
  // sample collection or result delivery) keep the content on screen and spin on the option pressed.
  if (!priced) {
    if (!checkout.quote.isPending) return null;
    return (
      <View className="items-center py-16">
        <ActivityIndicator />
      </View>
    );
  }

  const homeBlocked = !priced.allowedCollectionOptions.includes('home');
  const reprice = Boolean(priced) && checkout.quote.isFetching;

  // The same date and time steps as a consultation booking: each answered step folds to a line.
  const labDays: DayOfSlots[] = checkout.days.map((key) => ({
    key,
    date: new Date(`${key}T12:00:00Z`),
    slots:
      key === checkout.date
        ? (checkout.slots.data ?? [])
            .filter((item) => item.remaining > 0)
            .map((item) => ({ id: item.start, startsAt: item.start, endsAt: item.end }))
        : [],
  }));
  const visibleSlots = labDays.find((day) => day.key === checkout.date)?.slots.length ?? 0;

  return (
    <View className="gap-6">
      <View className="gap-1">
        <Text className="text-[15px] font-bold">{`${lab.labName} · ${lab.branchName}`}</Text>
        <Text className="text-xs leading-4.5 text-muted-foreground">{lab.address}</Text>
        {priced.lines.map((line) => (
          <View key={line.name} className="mt-1 flex-row justify-between gap-3">
            <Text className="min-w-0 flex-1 text-[13px]">{line.name}</Text>
            <Text className="text-[13px] text-muted-foreground">{formatNaira(line.priceKobo)}</Text>
          </View>
        ))}
      </View>

      {priced.allowedCollectionOptions.length > 1 || homeBlocked ? (
        <Block title="Where should we take your sample?">
          <View className="gap-2.5">
            {lab.labVisits ? (
              <Choosable
                selected={collection === 'lab_visit'}
                loading={reprice}
                label="At the lab"
                onPress={() => checkout.setCollection('lab_visit')}>
                <Text className="text-[14px] font-bold">At the lab</Text>
                <Text className="text-xs text-muted-foreground">You visit the facility</Text>
              </Choosable>
            ) : null}
            {lab.homeCollection ? (
              <Choosable
                selected={collection === 'home'}
                disabled={homeBlocked}
                loading={reprice}
                label="At home"
                onPress={() => checkout.setCollection('home')}>
                <Text className="text-[14px] font-bold">At home</Text>
                <Text className="text-xs text-muted-foreground">
                  {homeBlocked
                    ? `Not possible: ${priced.blockingTests.map((test) => test.name).join(', ')} must be done at the lab.`
                    : `A collector visits you · ${formatNaira(priced.fees.homeCollectionKobo)}`}
                </Text>
              </Choosable>
            ) : null}
          </View>
        </Block>
      ) : null}

      <ScheduleSteps
        days={labDays}
        caption={collection === 'home' ? 'Showing arrival windows' : 'Showing appointment times'}
        timeLoading={checkout.slots.isPending}
        dayKey={checkout.date}
        slotId={checkout.slot}
        firstNumber={1}
        onDay={checkout.setDate}
        onSlot={checkout.setSlot}
      />
      {!checkout.slots.isPending && visibleSlots === 0 ? (
        <Text className="text-[13px] leading-5 text-muted-foreground">
          No times are open on this day. Try another day.
        </Text>
      ) : null}

      {collection === 'home' ? (
        <Block title="Collection address">
          <TextField
            sheet
            label="Street address"
            value={checkout.address}
            onChangeText={checkout.setAddress}
            autoCapitalize="words"
          />
          {lab.homeAreas.length ? (
            <View className="flex-row flex-wrap gap-2">
              {lab.homeAreas.map((entry) => (
                <Chip
                  key={entry}
                  label={entry}
                  selected={checkout.area === entry}
                  onPress={() => checkout.setArea(entry)}
                />
              ))}
            </View>
          ) : null}
        </Block>
      ) : null}

      <Block title="How do you want your results?">
        <View className="gap-2.5">
          {priced.allowedResultDelivery.includes('collection') ? (
            <Choosable
              selected={resultDelivery === 'collection'}
              loading={reprice}
              label="Soft copy"
              onPress={() => checkout.setResultDelivery('collection')}>
              <Text className="text-[14px] font-bold">Soft copy in the app</Text>
              <Text className="text-xs text-muted-foreground">
                Free. You can collect a printed copy at the lab.
              </Text>
            </Choosable>
          ) : null}
          {priced.allowedResultDelivery.includes('delivery') ? (
            <Choosable
              selected={resultDelivery === 'delivery'}
              loading={reprice}
              label="Hard copy delivered"
              onPress={() => checkout.setResultDelivery('delivery')}>
              <Text className="text-[14px] font-bold">Printed copy delivered</Text>
              <Text className="text-xs text-muted-foreground">
                {`Brought to your address, plus a soft copy in the app${priced.fees.resultDeliveryKobo ? ` · ${formatNaira(priced.fees.resultDeliveryKobo)}` : ''}`}
              </Text>
            </Choosable>
          ) : null}
        </View>
        {resultDelivery === 'delivery' ? (
          <TextField
            sheet
            label="Delivery address"
            value={checkout.deliveryAddress}
            onChangeText={checkout.setDeliveryAddress}
            autoCapitalize="words"
          />
        ) : null}
      </Block>

      <Block title="Who is the test for?">
        <TextField
          sheet
          label="Patient name"
          value={checkout.name}
          onChangeText={checkout.setName}
          autoCapitalize="words"
          textContentType="name"
        />
        <TextField
          sheet
          label="Phone number"
          value={checkout.phone}
          onChangeText={checkout.setPhone}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />
      </Block>

      <View className="gap-2 rounded-2xl border border-border bg-secondary/30 p-4">
        <Money label="Tests" value={priced.pricing.testsSubtotalKobo} />
        {priced.pricing.collectionFeeKobo ? (
          <Money label="Home collection" value={priced.pricing.collectionFeeKobo} />
        ) : null}
        {priced.pricing.deliveryFeeKobo ? (
          <Money label="Result delivery" value={priced.pricing.deliveryFeeKobo} />
        ) : null}
        {priced.pricing.serviceFeeKobo ? (
          <Money label="Service fee" value={priced.pricing.serviceFeeKobo} />
        ) : null}
        <View className="my-1 h-px bg-border" />
        <Money strong label="Total" value={priced.pricing.totalKobo} />
      </View>
    </View>
  );
}
