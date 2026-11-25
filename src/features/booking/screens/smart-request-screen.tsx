import { ActionButton } from '@/components/shared/action-button';
import { Reveal } from '@/components/shared/reveal';
import { SubScreen } from '@/components/shared/sub-screen';
import { Text } from '@/components/ui/text';
import { fullName, useProfile } from '@/features/profile/hooks/use-profile';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { View } from 'react-native';
import { BookingSuccess } from '../components/booking-success';
import { DetailsCard } from '../components/details-card';
import { AUDIO_OPTION, KindPicker, VIDEO_OPTION } from '../components/kind-picker';
import { PaymentOptions, usePayment } from '../components/payment-options';
import { PriceSummary, totalOf } from '../components/price-summary';
import { ScheduleSteps } from '../components/schedule-steps';
import { SMART_DURATION_MINS, SMART_FEE_NGN, SMART_SERVICE_FEE_NGN } from '../constants';
import type { PayChoice, Promo } from '../types';
import { clock, longDay, naira, openDays } from '../utils';

type SmartKind = 'video' | 'audio';

export function SmartRequestScreen() {
  const { profile } = useProfile();
  const [kind, setKind] = React.useState<SmartKind>('video');
  const [dayKey, setDayKey] = React.useState<string | null>(null);
  const [slotId, setSlotId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [symptoms, setSymptoms] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [promo, setPromo] = React.useState<Promo | null>(null);
  const [choice, setChoice] = React.useState<PayChoice>('wallet');
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const days = React.useMemo(() => openDays(SMART_DURATION_MINS, 'next-available'), []);
  const day = days.find((item) => item.key === dayKey);
  const slot = day?.slots.find((item) => item.id === slotId);
  const total = totalOf(SMART_FEE_NGN, SMART_SERVICE_FEE_NGN, false, promo);
  const payment = usePayment(total, choice);
  const missing = [
    ...(!slot ? ['A time'] : []),
    ...(slot && !reason ? ['Reason for visit'] : []),
    ...(choice === 'card' && !payment.hasCard ? ['A saved card'] : []),
  ];

  function send() {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 900);
  }

  if (sent && slot) {
    return (
      <SubScreen title="Request sent">
        <BookingSuccess
          title="Request sent"
          text="Approved doctors who match your request can now accept it. We'll tell you the moment one does."
          rows={[
            ['Doctor', 'Next available'],
            ['Type', kind === 'video' ? 'Video call' : 'Audio call'],
            ['Date', longDay(new Date(slot.startsAt))],
            ['Time', `${clock(slot.startsAt)} – ${clock(slot.endsAt)}`],
            ['Paid', naira(total)],
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
        label={
          busy
            ? 'Processing…'
            : slot
              ? payment.label.replace('Book', 'Send request')
              : 'Choose a time'
        }
        disabled={busy || missing.length > 0}
        onPress={send}
      />
    </View>
  );

  return (
    <SubScreen
      title="Next available doctor"
      description="Tell us what's going on and we'll route it to approved doctors who can attend to you."
      footer={footer}>
      <View className="gap-4">
        <View className="gap-3 rounded-2xl bg-card p-4">
          <Text className="text-[15px] font-bold">Consultation type</Text>
          <KindPicker<SmartKind>
            options={[
              { ...VIDEO_OPTION, text: 'Meet an available doctor online.' },
              { ...AUDIO_OPTION, text: 'Speak with an available doctor.' },
            ]}
            value={kind}
            onChange={setKind}
          />
        </View>

        <ScheduleSteps
          days={days}
          durationMins={SMART_DURATION_MINS}
          dayKey={dayKey}
          slotId={slotId}
          firstNumber={1}
          onDay={(key) => {
            setDayKey(key);
            setSlotId(null);
          }}
          onSlot={setSlotId}
        />

        {slot ? (
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
              label={`${kind === 'video' ? 'Video' : 'Audio'} consultation · ${SMART_DURATION_MINS} min`}
              feeNgn={SMART_FEE_NGN}
              serviceFeeNgn={SMART_SERVICE_FEE_NGN}
              included={false}
              promo={promo}
              onPromo={setPromo}
              allowPromo
            />
            <PaymentOptions totalNgn={total} choice={choice} onChoice={setChoice} />
            <Text className="px-1 text-center text-xs leading-4.5 text-muted-foreground">
              After payment, approved doctors who match your request can accept it and attend to
              you.
            </Text>
          </>
        ) : null}
      </View>
    </SubScreen>
  );
}
