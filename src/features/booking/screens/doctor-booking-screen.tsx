import { useDoctor, useMyDoctorPlans, useOpenSlots } from '@/api/booking';
import { ApiError } from '@/api/client';
import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { SegmentedControl } from '@/components/shared/segmented-control';
import { SubScreen } from '@/components/shared/sub-screen';
import { Text } from '@/components/ui/text';
import { drName } from '@/features/home/utils';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarOff, CloudOff, UserRoundX } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { bookDoctorVisit, bookingMessage, payForBooking, toPhotos } from '../book';
import { BookingSuccess } from '../components/booking-success';
import { DetailsCard } from '../components/details-card';
import { DoctorHeader } from '../components/doctor-header';
import { IN_PERSON_OPTION, KindPicker, VIDEO_OPTION } from '../components/kind-picker';
import { PaymentOptions, usePayment } from '../components/payment-options';
import { PriceSummary, totalOf } from '../components/price-summary';
import { RatePicker } from '../components/rate-picker';
import { ScheduleSteps } from '../components/schedule-steps';
import { StepCard } from '../components/step-card';
import { useEarliestBooking } from '../earliest';
import { useBookingIdentity } from '../identity';
import type { ConsultKind, PayChoice } from '../types';
import { clock, daysFromSlots, longDay, naira } from '../utils';

type Mode = 'visit' | 'plan';

export function DoctorBookingScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const doctorQuery = useDoctor(slug);
  const doctor = doctorQuery.data;
  const slotsQuery = useOpenSlots(slug, Boolean(doctor?.acceptingBookings));
  const plansQuery = useMyDoctorPlans(doctor?.userId ?? null);
  const identity = useBookingIdentity();
  const earliest = useEarliestBooking();

  // A patient can hold several plans with one doctor now: every usable
  // subscription counts, and the visit is charged to the one that covers it.
  const plans = (plansQuery.data ?? []).filter(
    (item) => item.status === 'active' || item.status === 'ending'
  );
  const plan = plans[0] ?? null;
  const included = plans
    .flatMap((item) => item.remaining)
    .find((row) => row.type === 'video' && row.remaining > 0);
  const includedMins = included?.durationMins ?? 0;

  const [mode, setMode] = React.useState<Mode>('visit');
  const [kind, setKind] = React.useState<ConsultKind | null>(null);
  const [rateIndex, setRateIndex] = React.useState<number | null>(null);
  const [editRate, setEditRate] = React.useState(false);
  const [dayKey, setDayKey] = React.useState<string | null>(null);
  const [slotId, setSlotId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [symptoms, setSymptoms] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [promo, setPromo] = React.useState('');
  const [picked, setPicked] = React.useState<PayChoice | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<{ key: string; id: string } | null>(null);
  // Kept as plain text when the booking succeeds, so the confirmation stays on screen no matter what the
  // live times do afterwards (the booked time disappears from the list).
  const [booked, setBooked] = React.useState<[string, string][] | null>(null);

  const planMode = mode === 'plan' && Boolean(included);
  const kinds: ConsultKind[] = doctor
    ? [
        ...(doctor.videoRates.length ? (['video'] as const) : []),
        ...(doctor.inPersonRates.length ? (['in_person'] as const) : []),
      ]
    : [];
  const activeKind: ConsultKind | null = planMode
    ? 'video'
    : (kind ?? (kinds.length === 1 ? kinds[0]! : null));
  const rates =
    !doctor || !activeKind ? [] : activeKind === 'video' ? doctor.videoRates : doctor.inPersonRates;
  const shown = planMode ? rates.filter((rate) => rate.durationMins === includedMins) : rates;
  const planRateIndex = planMode && shown.length === 1 ? 0 : null;
  const activeRateIndex = planRateIndex ?? rateIndex;
  const rate = activeRateIndex === null ? undefined : shown[activeRateIndex];

  const days = React.useMemo(
    () => (rate ? daysFromSlots(slotsQuery.data ?? [], rate.durationMins, earliest) : []),
    [rate, slotsQuery.data, earliest]
  );
  const day = days.find((item) => item.key === dayKey);
  const slot = day?.slots.find((item) => item.id === slotId);

  // The subscription actually covering this visit: the first usable plan
  // with a remaining video visit of the chosen length.
  const coveringPlan =
    rate && planMode
      ? (plans.find((item) =>
          item.remaining.some(
            (row) =>
              row.type === 'video' &&
              row.durationMins === rate.durationMins &&
              row.remaining > 0
          )
        ) ?? null)
      : null;
  const covered = planMode;
  const total = rate && doctor ? totalOf(rate.amountNgn, doctor.serviceFeeNgn, covered) : 0;
  const payment = usePayment(covered ? 0 : total, picked);
  const missing = [...(!slot ? ['A time'] : []), ...(slot && !reason ? ['Reason for visit'] : [])];

  async function book() {
    if (!doctor || !slot || !rate || !activeKind) return;
    setBusy(true);
    setError(null);
    const key = `${slot.id}|${rate.durationMins}|${activeKind}`;
    try {
      let id = created?.key === key ? created.id : null;
      if (!id) {
        const reply = await bookDoctorVisit({
          doctorId: doctor.userId,
          slotId: slot.id,
          inPerson: activeKind === 'in_person',
          type: activeKind === 'in_person' ? 'audio' : 'video',
          durationMins: rate.durationMins,
          reason,
          symptoms,
          photos: toPhotos(photos),
          identity: { name: identity.name, age: identity.age, sex: identity.sex },
        });
        id = reply.consultationId;
        setCreated({ key, id });
      }
      const result = await payForBooking(id, {
        promoCode: !covered && promo ? promo : undefined,
        paymentMethodId: covered ? undefined : payment.paymentMethodId,
        subscriptionId: covered ? (coveringPlan?.id ?? plan?.id) : undefined,
      });
      if (result.status === 'booked') {
        setBooked([
          ['Doctor', drName(doctor.name)],
          ['Type', activeKind === 'in_person' ? 'In person' : 'Video call'],
          ['Date', longDay(new Date(slot.startsAt))],
          ['Time', `${clock(slot.startsAt)} – ${clock(slot.endsAt)}`],
          ['Paid', covered ? 'Included in your plan' : naira(total)],
        ]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (failure) {
      const message = bookingMessage(failure);
      setError(
        covered && created
          ? `${message} Switch to "Pay per visit" to pay for this visit instead.`
          : message
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (/just taken/i.test(message)) {
        setSlotId(null);
        setCreated(null);
        slotsQuery.refetch();
      }
    } finally {
      setBusy(false);
    }
  }

  if (doctorQuery.isPending) {
    return (
      <SubScreen title="Book a visit">
        <View className="items-center py-24">
          <ActivityIndicator />
        </View>
      </SubScreen>
    );
  }

  if (!doctor) {
    const notFound = doctorQuery.error instanceof ApiError && doctorQuery.error.status === 404;
    return (
      <SubScreen title="Book a visit">
        <View className="rounded-2xl bg-card">
          <EmptyState
            icon={notFound ? UserRoundX : CloudOff}
            title={notFound ? "We couldn't find this doctor" : "Couldn't load this doctor"}
            text={
              notFound
                ? 'The link may be wrong, or the doctor is not taking bookings.'
                : doctorQuery.error instanceof Error
                  ? doctorQuery.error.message
                  : 'Check your connection and try again.'
            }
            action={
              notFound ? (
                <ActionButton
                  size="md"
                  label="Find a doctor"
                  onPress={() => router.replace('/book/find')}
                />
              ) : (
                <ActionButton size="md" label="Try again" onPress={() => doctorQuery.refetch()} />
              )
            }
          />
        </View>
      </SubScreen>
    );
  }

  if (booked) {
    return (
      <SubScreen title="Booked">
        <BookingSuccess
          title="You're booked"
          text={`Your visit with ${drName(doctor.name)} is confirmed. We'll remind you before it starts.`}
          rows={booked}
        />
      </SubScreen>
    );
  }

  const footer = (
    <View className="gap-2 rounded-3xl bg-card p-3">
      {error ? (
        <Text role="alert" className="text-center text-xs leading-4.5 text-destructive">
          {error}
        </Text>
      ) : null}
      {missing.length ? (
        <Text className="text-center text-xs text-muted-foreground">{`Still needed: ${missing.join(', ')}`}</Text>
      ) : null}
      <ActionButton
        size="md"
        label={
          busy
            ? 'Processing…'
            : slot
              ? created?.key === `${slot.id}|${rate?.durationMins}|${activeKind}` && error
                ? 'Try payment again'
                : covered
                  ? 'Book with my plan'
                  : payment.label
              : 'Choose a time'
        }
        disabled={busy || missing.length > 0}
        onPress={book}
      />
    </View>
  );

  return (
    <SubScreen title="Book a visit" footer={footer}>
      <View className="gap-4">
        <DoctorHeader doctor={doctor} />

        {!doctor.acceptingBookings ? (
          <View className="rounded-2xl bg-card">
            <EmptyState
              icon={CalendarOff}
              title="Not available to book"
              text="This doctor hasn't set up consultation times yet."
            />
          </View>
        ) : (
          <>
            {plan && included ? (
              <View className="gap-3 rounded-2xl bg-card p-4">
                <SegmentedControl<Mode>
                  value={mode}
                  onChange={(next) => {
                    setMode(next);
                    setRateIndex(null);
                    setDayKey(null);
                    setSlotId(null);
                    setError(null);
                  }}
                  options={[
                    { value: 'visit', label: 'Pay per visit' },
                    { value: 'plan', label: 'My subscription' },
                  ]}
                />
                <Text className="text-xs leading-4.5 text-muted-foreground">
                  {planMode
                    ? `This visit uses your ${(coveringPlan ?? plan)?.terms.name ?? 'plan'} plan. ${included.remaining} of ${included.count} included visits left, no payment needed.`
                    : plans.length > 1
                      ? `You have ${plans.length} plans with this doctor. Switch to "My subscription" to use an included visit.`
                      : `You have a plan with this doctor. Switch to "My subscription" to use an included visit.`}
                </Text>
              </View>
            ) : null}

            {!planMode && kinds.length > 1 ? (
              <View className="gap-3 rounded-2xl bg-card p-4">
                <Text className="text-[15px] font-bold">Consultation type</Text>
                <KindPicker
                  options={[VIDEO_OPTION, IN_PERSON_OPTION]}
                  value={kind}
                  onChange={(next) => {
                    setKind(next);
                    setRateIndex(null);
                    setDayKey(null);
                    setSlotId(null);
                  }}
                />
                {kind === 'in_person' && doctor.practiceAddress ? (
                  <Text className="text-xs leading-4.5 text-muted-foreground">
                    {doctor.practiceAddress}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {activeKind ? (
              <StepCard
                number={1}
                title={planMode ? 'Your plan visit' : 'Select duration & rate'}
                summary={
                  rate
                    ? `${rate.durationMins} min · ${covered ? 'Included' : naira(rate.amountNgn)}`
                    : undefined
                }
                done={Boolean(rate)}
                reveal={false}
                expanded={!rate || editRate}
                onEdit={planMode ? undefined : () => setEditRate(true)}>
                <RatePicker
                  rates={shown}
                  selected={activeRateIndex}
                  included={covered}
                  onChange={(index) => {
                    setEditRate(false);
                    if (index !== rateIndex) {
                      setDayKey(null);
                      setSlotId(null);
                    }
                    setRateIndex(index);
                  }}
                />
              </StepCard>
            ) : null}

            {rate && slotsQuery.isPending ? (
              <View className="items-center py-6">
                <ActivityIndicator />
              </View>
            ) : null}
            {rate && slotsQuery.isError ? (
              <View className="rounded-2xl bg-card">
                <EmptyState
                  icon={CloudOff}
                  title="Couldn't load times"
                  text="Check your connection and try again."
                  action={
                    <ActionButton
                      size="md"
                      label="Try again"
                      onPress={() => slotsQuery.refetch()}
                    />
                  }
                />
              </View>
            ) : null}
            {rate && slotsQuery.data ? (
              <ScheduleSteps
                days={days}
                durationMins={rate.durationMins}
                dayKey={dayKey}
                slotId={slotId}
                firstNumber={2}
                onDay={(key) => {
                  setDayKey(key);
                  setSlotId(null);
                }}
                onSlot={setSlotId}
              />
            ) : null}

            {slot && rate ? (
              <>
                <Reveal>
                  <DetailsCard
                    identity={identity}
                    reason={reason}
                    onReason={setReason}
                    symptoms={symptoms}
                    onSymptoms={setSymptoms}
                    photos={photos}
                    onPhotos={setPhotos}
                  />
                </Reveal>
                <PriceSummary
                  label={`${activeKind === 'video' ? 'Video' : 'In-person'} consultation · ${rate.durationMins} min`}
                  feeNgn={rate.amountNgn}
                  serviceFeeNgn={doctor.serviceFeeNgn}
                  included={covered}
                  promo={promo}
                  onPromo={setPromo}
                  allowPromo={!planMode}
                />
                {total > 0 && !covered ? (
                  <PaymentOptions payment={payment} onChoice={setPicked} />
                ) : null}
                <Text className="px-1 text-center text-xs leading-4.5 text-muted-foreground">
                  After you book, we'll send a reminder and a link to join at the time.
                </Text>
              </>
            ) : null}
          </>
        )}
      </View>
    </SubScreen>
  );
}
