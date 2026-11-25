import { ActionButton } from '@/components/shared/action-button';
import { Reveal } from '@/components/shared/reveal';
import { SubScreen } from '@/components/shared/sub-screen';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { View } from 'react-native';
import { bookingMessage, payForBooking, sendSmartRequest, toPhotos } from '../book';
import { BookingSuccess } from '../components/booking-success';
import { DetailsCard } from '../components/details-card';
import { AUDIO_OPTION, KindPicker, VIDEO_OPTION } from '../components/kind-picker';
import { PaymentOptions, usePayment } from '../components/payment-options';
import { ScheduleSteps } from '../components/schedule-steps';
import { SMART_DURATION_MINS } from '../constants';
import { useEarliestBooking } from '../earliest';
import { useBookingIdentity } from '../identity';
import type { PayChoice } from '../types';
import { clock, longDay, requestDays } from '../utils';

type SmartKind = 'video' | 'audio';

export function SmartRequestScreen() {
  const identity = useBookingIdentity();
  const earliest = useEarliestBooking();
  const [kind, setKind] = React.useState<SmartKind>('video');
  const [dayKey, setDayKey] = React.useState<string | null>(null);
  const [slotId, setSlotId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [symptoms, setSymptoms] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [picked, setPicked] = React.useState<PayChoice | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<{ key: string; id: string } | null>(null);
  const [sent, setSent] = React.useState(false);

  const days = React.useMemo(() => requestDays(SMART_DURATION_MINS, earliest), [earliest]);
  const day = days.find((item) => item.key === dayKey);
  const slot = day?.slots.find((item) => item.id === slotId);
  // The price is set by NairaClinic when the request is sent, so no total is shown up front.
  const payment = usePayment(null, picked);
  const missing = [
    ...(!slot ? ['A time'] : []),
    ...(slot && !reason ? ['Reason for visit'] : []),
    ...(slot ? identity.missing : []),
  ];

  async function send() {
    if (!slot) return;
    setBusy(true);
    setError(null);
    const key = `${slot.id}|${kind}`;
    try {
      let id = created?.key === key ? created.id : null;
      if (!id) {
        const reply = await sendSmartRequest({
          type: kind,
          durationMins: SMART_DURATION_MINS,
          scheduledAtUtc: slot.startsAt,
          reason,
          symptoms,
          photos: toPhotos(photos),
          identity: { name: identity.name, age: identity.age, sex: identity.sex },
        });
        id = reply.consultationId;
        setCreated({ key, id });
      }
      const result = await payForBooking(id, { paymentMethodId: payment.paymentMethodId });
      if (result.status === 'booked') {
        setSent(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (failure) {
      setError(bookingMessage(failure));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setBusy(false);
    }
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
          ]}
        />
      </SubScreen>
    );
  }

  const retrying = Boolean(slot && created?.key === `${slot.id}|${kind}` && error);
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
              ? retrying
                ? 'Try payment again'
                : 'Send request'
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
                identity={identity}
                reason={reason}
                onReason={setReason}
                symptoms={symptoms}
                onSymptoms={setSymptoms}
                photos={photos}
                onPhotos={setPhotos}
              />
            </Reveal>
            <PaymentOptions payment={payment} onChoice={setPicked} />
            <Text className="px-1 text-center text-xs leading-4.5 text-muted-foreground">
              The price is set when you send the request. Your wallet is used first, and you only
              pay the rest. Approved doctors who match can then accept it and attend to you.
            </Text>
          </>
        ) : null}
      </View>
    </SubScreen>
  );
}
