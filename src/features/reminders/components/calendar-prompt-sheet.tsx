import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import { BellRing, CalendarCheck, CalendarPlus, Smartphone } from 'lucide-react-native';
import * as React from 'react';
import { Linking, View } from 'react-native';
import {
  connectCalendar,
  useCalendarPrompt,
  isCalendarConnected,
  snoozeCalendarPrompt,
} from '../hooks/use-calendar-prompt';

const BENEFITS = [
  { icon: BellRing, text: 'Medicine and test reminders appear next to everything else you plan.' },
  { icon: Smartphone, text: 'You still get an alert when the app is closed.' },
  { icon: CalendarCheck, text: 'You can turn it off in your phone settings at any time.' },
];

type CalendarPromptSheetProps = { open: boolean; onClose: () => void };

export function CalendarPromptSheet({ open, onClose }: CalendarPromptSheetProps) {
  const { connected } = useCalendarPrompt();
  const [busy, setBusy] = React.useState(false);
  const [denied, setDenied] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setBusy(false);
      setDenied(false);
    }
  }, [open]);

  function dismiss() {
    if (!isCalendarConnected()) snoozeCalendarPrompt();
    onClose();
  }

  async function connect() {
    setBusy(true);
    const granted = await connectCalendar().catch(() => false);
    setBusy(false);
    if (granted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } else {
      setDenied(true);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={dismiss}
      showClose
      eyebrow={connected ? 'Calendar connected' : 'Never miss a reminder'}
      title={connected ? 'Your calendar is connected.' : 'Add your reminders to your calendar.'}
      subtitle={
        connected
          ? 'Your reminders can show up in your calendar. You can change access in your phone settings.'
          : 'Connect your calendar and your reminders will show up there too.'
      }>
      <View className="gap-3">
        {BENEFITS.map(({ icon, text }) => (
          <View key={text} className="flex-row items-center gap-3">
            <View className="size-9 items-center justify-center rounded-full bg-secondary">
              <Icon as={icon} className="size-4 text-primary" />
            </View>
            <Text className="flex-1 text-[13px] leading-5 text-muted-foreground">{text}</Text>
          </View>
        ))}
      </View>

      {denied ? (
        <View className="gap-1 rounded-2xl bg-warning-soft p-3.5">
          <Text className="text-[13px] font-bold text-warning">Calendar access is off</Text>
          <Text className="text-xs leading-4.5 text-warning">
            Turn it on for NairaClinic in your phone settings, then come back. We’ll ask again
            tomorrow.
          </Text>
        </View>
      ) : null}

      <View className="gap-2">
        {connected ? (
          <>
            <ActionButton
              size="md"
              icon={CalendarCheck}
              label="Open phone settings"
              variant="outline"
              onPress={() => {
                Linking.openSettings();
                onClose();
              }}
            />
            <ActionButton size="md" label="Done" onPress={onClose} />
          </>
        ) : (
          <>
            {denied ? (
              <ActionButton
                size="md"
                icon={CalendarPlus}
                label="Open settings"
                onPress={() => {
                  Linking.openSettings();
                  onClose();
                }}
              />
            ) : (
              <ActionButton
                size="md"
                icon={CalendarPlus}
                label={busy ? 'Connecting…' : 'Connect calendar'}
                disabled={busy}
                onPress={connect}
              />
            )}
            <ActionButton size="md" variant="ghost" label="Not now" onPress={dismiss} />
            {denied ? null : (
              <Text className="text-center text-xs text-muted-foreground">
                If you skip, we’ll remind you again tomorrow.
              </Text>
            )}
          </>
        )}
      </View>
    </Sheet>
  );
}
