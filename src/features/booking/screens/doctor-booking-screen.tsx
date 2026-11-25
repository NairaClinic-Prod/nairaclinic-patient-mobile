import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/empty-state';
import { SegmentedControl } from '@/components/shared/segmented-control';
import { Reveal } from '@/components/shared/reveal';
import { SubScreen } from '@/components/shared/sub-screen';
import { Text } from '@/components/ui/text';
import { useDoctorPlans } from '@/features/doctor-plans/store';
import { drName } from '@/features/home/utils';
import { fullName, useProfile } from '@/features/profile/hooks/use-profile';
import * as Haptics from 'expo-haptics';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { CalendarOff } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { BookingSuccess } from '../components/booking-success';
import { DetailsCard } from '../components/details-card';
import { DoctorHeader } from '../components/doctor-header';
import { IN_PERSON_OPTION, KindPicker, VIDEO_OPTION } from '../components/kind-picker';
import { PaymentOptions, usePayment } from '../components/payment-options';
import { PriceSummary, totalOf } from '../components/price-summary';
import { RatePicker } from '../components/rate-picker';
import { ScheduleSteps } from '../components/schedule-steps';
import { StepCard } from '../components/step-card';
import type { ConsultKind, PayChoice, Promo } from '../types';
import { clock, findDoctor, longDay, naira, openDays } from '../utils';

type Mode = 'visit' | 'plan';

export function DoctorBookingScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const doctor = findDoctor(slug);
  const { profile } = useProfile();
  const { plans } = useDoctorPlans();

  const plan = doctor
    ? plans.find((item) => item.status === 'active' && item.doctor.includes(doctor.name))
    : undefined;
  const included = plan?.remaining.find(
    (row) => row.remaining > 0 && row.label.startsWith('Video')
  );
  const includedMins = included ? Number(included.label.match(/(\d+) min/)?.[1] ?? 0) : 0;

  const [mode, setMode] = React.useState<Mode>('visit');
  const [kind, setKind] = React.useState<ConsultKind | null>(null);
  const [rateIndex, setRateIndex] = React.useState<number | null>(null);
  const [editRate, setEditRate] = React.useState(false);
  const [dayKey, setDayKey] = React.useState<string | null>(null);
  const [slotId, setSlotId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [symptoms, setSymptoms] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [promo, setPromo] = React.useState<Promo | null>(null);
  const [choice, setChoice] = React.useState<PayChoice>('wallet');
  const [busy, setBusy] = React.useState(false);
  const [booked, setBooked] = React.useState(false);

  const planMode = mode === 'plan' && Boolean(included);
  const kinds: ConsultKind[] = doctor
    ? [
        ...(doctor.videoRates.length ? (['video'] as const) : []),
        ...(doctor.inPersonRates.length ? (['in_person'] as const) : []),
      ]
    : [];
  const activeKind: ConsultKind | null = planMode
    ? 'video'
    : (kind ?? (kinds.length === 1 ? kinds[0] : null));
  const rates =
    !doctor || !activeKind ? [] : activeKind === 'video' ? doctor.videoRates : doctor.inPersonRates;
  const shown = planMode ? rates.filter((rate) => rate.durationMins === includedMins) : rates;
  const planRateIndex = planMode && shown.length === 1 ? 0 : null;
  const activeRateIndex = planRateIndex ?? rateIndex;
  const rate = activeRateIndex === null ? undefined : shown[activeRateIndex];

  const days = React.useMemo(
    () => (rate && doctor ? openDays(rate.durationMins, doctor.slug) : []),
    [rate, doctor]
  );
  const day = days.find((item) => item.key === dayKey);
  const slot = day?.slots.find((item) => item.id === slotId);

  const covered = planMode;
  const total = rate && doctor ? totalOf(rate.amountNgn, doctor.serviceFeeNgn, covered, promo) : 0;
  const payment = usePayment(total, choice);
  const missing = [
    ...(!slot ? ['A time'] : []),
    ...(slot && !reason ? ['Reason for visit'] : []),
    ...(total > 0 && choice === 'card' && !payment.hasCard ? ['A saved card'] : []),
  ];

  if (!doctor) return <Redirect href="/book" />;

  function book() {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setBooked(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 900);
  }

  if (booked && slot && rate) {
    return (
      <SubScreen title="Booked">
        <BookingSuccess
          title="You're booked"
          text={`Your visit with ${drName(doctor.name)} is confirmed. We'll remind you before it starts.`}
          rows={[
            ['Doctor', drName(doctor.name)],
            ['Type', activeKind === 'in_person' ? 'In person' : 'Video call'],
            ['Date', longDay(new Date(slot.startsAt))],
            ['Time', `${clock(slot.startsAt)} – ${clock(slot.endsAt)}`],
            ['Paid', covered ? 'Included in your plan' : naira(total)],
          ]}
        />
      </SubScreen>
    );
  }

  const footer = (
    <View className="gap-2 rounded-3xl bg-card p-3">
      {missing.length ? (
        <Text className="text-center text-xs text-muted-foreground">{`Still needed: ${missing.join(', ')}`}</Text>
      ) : null}
      <ActionButton
        size="md"
        label={busy ? 'Processing…' : slot ? payment.label : 'Choose a time'}
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
                  }}
                  options={[
                    { value: 'visit', label: 'Pay per visit' },
                    { value: 'plan', label: 'My subscription' },
                  ]}
                />
                <Text className="text-xs leading-4.5 text-muted-foreground">
                  {planMode
                    ? `This visit uses your ${plan.name} plan. ${included.remaining} of ${included.count} included visits left, no payment needed.`
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

            {rate ? (
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
                    forName={fullName(profile)}
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
                {total > 0 ? (
                  <PaymentOptions totalNgn={total} choice={choice} onChoice={setChoice} />
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
