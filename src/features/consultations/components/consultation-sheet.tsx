import {
  rescheduleConsultation,
  useConsultation,
  useDoctorSlots,
  useRescheduleEligibility,
} from '@/api/consultations';
import { ApiError } from '@/api/client';
import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { StatusPill } from '@/components/shared/status-pill';
import { TextField } from '@/components/shared/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ScheduleSteps } from '@/features/booking/components/schedule-steps';
import {
  DEFAULT_TIMING,
  clock,
  daysFromSlots,
  earliestBookingAt,
  longDay,
} from '@/features/booking/utils';
import { drName } from '@/features/home/utils';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CalendarClock, MapPin, Video } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { closeConsultation, useConsultationSheet } from '../ui-store';
import { joinWindow, statusLabel } from '../utils';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-[13px] text-muted-foreground">{label}</Text>
      <Text className="min-w-0 flex-1 text-right text-[13px] font-medium">{value}</Text>
    </View>
  );
}

const TONE: Record<string, 'active' | 'pending' | 'info' | 'inactive'> = {
  scheduled: 'active',
  upcoming: 'active',
  rescheduled: 'active',
  in_progress: 'info',
  completed: 'inactive',
  ended: 'inactive',
  cancelled: 'inactive',
  missed: 'pending',
  expired: 'pending',
};

// One consultation: when, who, where, whether it can be moved, and the buttons to join or move it.
export function ConsultationSheet() {
  const { open, id } = useConsultationSheet();
  const query = useConsultation(open ? id : null);
  const data = query.data;
  const consultation = data?.consultation;
  const doctor = data?.doctor;
  const scheduled = consultation?.status === 'scheduled';

  const eligibility = useRescheduleEligibility(id, open && scheduled);
  const [step, setStep] = React.useState<'details' | 'pick'>('details');
  const slots = useDoctorSlots(consultation?.doctorUserId ?? null, open && step === 'pick');
  const [dayKey, setDayKey] = React.useState<string | null>(null);
  const [slotId, setSlotId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [movedTo, setMovedTo] = React.useState<string | null>(null);
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!open) return;
    setStep('details');
    setDayKey(null);
    setSlotId(null);
    setReason('');
    setError(null);
    setMovedTo(null);
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [open, id]);

  const info = eligibility.data;
  const earliest = info?.earliestRescheduleAtUtc
    ? Date.parse(info.earliestRescheduleAtUtc)
    : earliestBookingAt(now, DEFAULT_TIMING);
  const days = React.useMemo(
    () => daysFromSlots(slots.data ?? [], 0, earliest),
    [slots.data, earliest]
  );
  const day = days.find((item) => item.key === dayKey);
  const slot = day?.slots.find((item) => item.id === slotId);

  const start = consultation?.scheduledAtUtc ? new Date(consultation.scheduledAtUtc) : null;
  const end =
    start && consultation?.durationMins
      ? new Date(start.getTime() + consultation.durationMins * 60_000)
      : null;
  const stage = consultation?.lifecycle ?? consultation?.status ?? '';
  const inPerson = consultation?.metaJson?.source?.kind === 'in_person';
  const smart = consultation?.metaJson?.source?.kind === 'in_app_referral';
  const window = joinWindow(
    consultation?.scheduledAtUtc,
    consultation?.durationMins,
    consultation?.status ?? '',
    now
  );
  const left =
    info?.maxReschedules !== undefined ? info.maxReschedules - (info.rescheduleCount ?? 0) : null;
  const address = doctor?.practiceAddress;
  const mapsUrl = address?.formattedAddress
    ? address.lat != null && address.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${address.lat},${address.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.formattedAddress)}`
    : null;
  const doctorNote = consultation?.metaJson?.latestRescheduleReason?.trim();

  async function move() {
    if (!id || !slot) return;
    setSaving(true);
    setError(null);
    try {
      await rescheduleConsultation(id, {
        scheduledAtUtc: slot.startsAt,
        slotId: slot.id,
        timezone: (() => {
          try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          } catch {
            return 'UTC';
          }
        })(),
        ...(reason.trim() ? { reason: reason.trim().slice(0, 500) } : {}),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMovedTo(`${longDay(new Date(slot.startsAt))}, ${clock(slot.startsAt)}`);
      setStep('details');
    } catch (failure) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(
        failure instanceof ApiError && failure.status === 0
          ? "Can't reach NairaClinic. Check your connection and try again."
          : failure instanceof Error
            ? failure.message
            : "Couldn't move this visit. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const picking = step === 'pick';
  const title = picking
    ? 'Choose a new time'
    : consultation
      ? `Visit with ${drName(doctor?.name ?? 'your doctor')}`
      : 'Consultation';

  let footer: React.ReactNode = undefined;
  if (picking) {
    footer = (
      <View className="gap-2">
        {error ? (
          <Text role="alert" className="text-xs text-destructive">
            {error}
          </Text>
        ) : null}
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            label="Back"
            variant="outline"
            className="flex-1"
            disabled={saving}
            onPress={() => setStep('details')}
          />
          <ActionButton
            size="md"
            label={saving ? 'Moving…' : 'Move my visit'}
            className="flex-[2]"
            disabled={!slot || saving}
            onPress={move}
          />
        </View>
      </View>
    );
  } else if (consultation) {
    footer = (
      <View className="gap-2">
        {window !== 'closed' ? (
          <ActionButton
            size="md"
            label={window === 'open' ? 'Join consultation' : 'Join opens 5 minutes before'}
            icon={Video}
            disabled={window !== 'open'}
            onPress={() => {
              closeConsultation();
              router.push(`/call/${encodeURIComponent(consultation.id)}`);
            }}
          />
        ) : null}
        {scheduled && info?.eligible ? (
          <ActionButton
            size="md"
            label="Reschedule"
            icon={CalendarClock}
            variant="outline"
            onPress={() => setStep('pick')}
          />
        ) : null}
      </View>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={closeConsultation}
      title={title}
      subtitle={
        picking
          ? "Pick a day, then one of your doctor's open times."
          : (doctor?.specialty ?? undefined)
      }
      snapPoints={picking ? ['92%'] : undefined}
      footer={footer}>
      {query.isPending ? (
        <View className="items-center py-10">
          <ActivityIndicator />
        </View>
      ) : query.isError || !consultation ? (
        <View className="items-center gap-3 py-6">
          <Text className="text-center text-sm text-muted-foreground">
            {query.error instanceof Error
              ? query.error.message
              : "Couldn't load this consultation."}
          </Text>
          <ActionButton label="Try again" variant="outline" onPress={() => query.refetch()} />
        </View>
      ) : picking ? (
        <>
          {slots.isPending ? (
            <View className="items-center py-6">
              <ActivityIndicator />
            </View>
          ) : slots.isError ? (
            <Text className="text-sm text-muted-foreground">
              Couldn't load your doctor's times. Go back and try again.
            </Text>
          ) : (
            <ScheduleSteps
              days={days}
              durationMins={consultation.durationMins ?? 30}
              dayKey={dayKey}
              slotId={slotId}
              firstNumber={1}
              onDay={(key) => {
                setDayKey(key);
                setSlotId(null);
              }}
              onSlot={setSlotId}
            />
          )}
          <TextField
            sheet
            tone="muted"
            label="Reason (optional)"
            multiline
            maxLength={500}
            placeholder="Tell your doctor why you're moving it"
            value={reason}
            onChangeText={setReason}
          />
          {left !== null ? (
            <Text className="text-xs text-muted-foreground">
              {`You can reschedule ${left} more ${left === 1 ? 'time' : 'times'}.`}
            </Text>
          ) : null}
        </>
      ) : (
        <>
          {movedTo ? (
            <View className="rounded-2xl bg-success/10 p-3.5">
              <Text className="text-[13px] font-semibold text-success">{`Moved to ${movedTo}. Your doctor has been told.`}</Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-2">
            <StatusPill tone={TONE[stage] ?? 'info'}>{statusLabel(stage)}</StatusPill>
            {inPerson ? <StatusPill tone="info">In person</StatusPill> : null}
          </View>

          <View className="gap-3 rounded-2xl bg-muted p-3.5">
            <Row
              label="Doctor"
              value={
                smart && !doctor?.name ? 'Doctor on call' : drName(doctor?.name ?? 'Your doctor')
              }
            />
            <Row label="Date" value={start ? longDay(start) : 'To be confirmed'} />
            <Row
              label="Time"
              value={
                start
                  ? `${clock(start.toISOString())}${end ? ` – ${clock(end.toISOString())}` : ''}`
                  : '—'
              }
            />
            {consultation.durationMins ? (
              <Row label="Duration" value={`${consultation.durationMins} minutes`} />
            ) : null}
            <Row
              label="Type"
              value={
                inPerson ? 'In person' : consultation.type === 'audio' ? 'Audio call' : 'Video call'
              }
            />
            {consultation.reason ? (
              <Row label="Reason" value={consultation.reason.replace(/_/g, ' ')} />
            ) : null}
          </View>

          {inPerson && address?.formattedAddress ? (
            <View className="gap-2 rounded-2xl bg-muted p-3.5">
              <View className="flex-row items-start gap-2">
                <Icon as={MapPin} className="mt-0.5 size-4 text-primary" />
                <Text className="flex-1 text-[13px] leading-5">{address.formattedAddress}</Text>
              </View>
              {mapsUrl ? (
                <ActionButton
                  label="Get directions"
                  variant="outline"
                  className="self-start"
                  onPress={() => Linking.openURL(mapsUrl)}
                />
              ) : null}
            </View>
          ) : null}

          {doctorNote ? (
            <View className="gap-1 rounded-2xl bg-secondary/50 p-3.5">
              <Text className="text-xs font-semibold text-muted-foreground">
                Your doctor moved this visit
              </Text>
              <Text className="text-[13px] leading-5">{doctorNote}</Text>
            </View>
          ) : null}

          {scheduled ? (
            <View className="gap-1 rounded-2xl bg-muted p-3.5">
              <Text className="text-[13px] font-bold">Rescheduling</Text>
              {eligibility.isPending ? (
                <Text className="text-xs text-muted-foreground">Checking…</Text>
              ) : info?.eligible ? (
                <Text className="text-xs leading-4.5 text-muted-foreground">
                  {`You can move this visit to another time that suits you${left !== null ? `. ${left} ${left === 1 ? 'change' : 'changes'} left.` : '.'}`}
                </Text>
              ) : (
                <Text className="text-xs leading-4.5 text-muted-foreground">
                  {info?.reason ?? "This visit can't be rescheduled."}
                </Text>
              )}
            </View>
          ) : null}
        </>
      )}
    </Sheet>
  );
}
