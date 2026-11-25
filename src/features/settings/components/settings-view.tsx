import { PressableScale } from '@/components/shared/pressable-scale';
import { SegmentedControl } from '@/components/shared/segmented-control';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/use-color';
import { CalendarPromptSheet } from '@/features/reminders/components/calendar-prompt-sheet';
import { useCalendarPrompt } from '@/features/reminders/hooks/use-calendar-prompt';
import { cn } from '@/lib/utils';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router, type Href } from 'expo-router';
import {
  CalendarDays,
  ChevronRight,
  KeyRound,
  Languages,
  LockKeyhole,
  LogOut,
  ScrollText,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Linking, Switch, View } from 'react-native';
import { ChangePinSheet } from '@/features/security/components/change-pin-sheet';
import { PRIVACY_URL, TERMS_URL } from '@/constants/links';
import { addDevice, removeDevice, useDevices } from '@/features/security/store';
import {
  setChannel,
  setTheme,
  setTopic,
  useSettings,
  type ThemeChoice,
} from '../hooks/use-settings';

const TOPICS = [
  { key: 'reminders', title: 'Reminders', text: 'Medicine, test and care reminders' },
  { key: 'appointments', title: 'Appointments', text: 'Consultations and when to join' },
  { key: 'orders', title: 'Orders and delivery', text: 'Pharmacy prices, riders and collection' },
  { key: 'labs', title: 'Lab tests', text: 'Bookings and released results' },
  { key: 'offers', title: 'Offers and tips', text: 'Health tips and NairaClinic news' },
] as const;

const CHANNELS = [
  { key: 'push', title: 'Push notifications', text: 'On this phone' },
  { key: 'whatsapp', title: 'WhatsApp', text: 'Messages to your phone number' },
  { key: 'sms', title: 'SMS', text: 'Text messages to your phone number' },
  { key: 'email', title: 'Email', text: 'To your email address' },
] as const;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl bg-card">
        {React.Children.toArray(children).map((child, index) => (
          <View key={index} className={cn(index > 0 && 'border-t border-border')}>
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

function Row({
  icon,
  title,
  text,
  danger,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      scaleTo={0.99}
      role="button"
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3.5">
      <Icon as={icon} className={cn('size-5', danger ? 'text-destructive' : 'text-foreground')} />
      <View className="min-w-0 flex-1">
        <Text className={cn('text-[14px] font-semibold', danger && 'text-destructive')}>
          {title}
        </Text>
        {text ? <Text className="text-xs leading-4.5 text-muted-foreground">{text}</Text> : null}
      </View>
      <Icon as={ChevronRight} className="size-4 text-muted-foreground" />
    </PressableScale>
  );
}

function SwitchRow({
  title,
  text,
  value,
  onChange,
}: {
  title: string;
  text: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  const color = useColor();
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-semibold">{title}</Text>
        <Text className="text-xs leading-4.5 text-muted-foreground">{text}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={(next) => {
          Haptics.selectionAsync();
          onChange(next);
        }}
        trackColor={{ false: color.border, true: color.primary }}
        ios_backgroundColor={color.border}
        style={{ transform: [{ scale: 0.85 }] }}
      />
    </View>
  );
}

export function SettingsView() {
  const { devices } = useDevices();
  const settings = useSettings();
  const calendar = useCalendarPrompt();
  const [pinOpen, setPinOpen] = React.useState(false);
  const [pinDone, setPinDone] = React.useState(false);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const go = (path: string) => router.push(path as Href);

  return (
    <View className="gap-6">
      <Group title="Security">
        <Row
          icon={KeyRound}
          title="Sign-in PIN"
          text={pinDone ? 'PIN changed. Other devices were signed out.' : 'Change your 5-digit PIN'}
          onPress={() => {
            setPinDone(false);
            setPinOpen(true);
          }}
        />
        <SwitchRow
          title="Fingerprint or Face ID"
          text={
            devices.length
              ? `On for ${devices.length === 1 ? '1 device' : `${devices.length} devices`}`
              : 'Sign in without typing your PIN'
          }
          value={devices.length > 0}
          onChange={(next) =>
            next ? addDevice() : devices.forEach((device) => removeDevice(device.id))
          }
        />
        <Row
          icon={ShieldCheck}
          title="Privacy and security"
          text="Devices, record privacy and your data"
          onPress={() => go('/security')}
        />
      </Group>

      <Group title="Notify me about">
        {TOPICS.map((topic) => (
          <SwitchRow
            key={topic.key}
            title={topic.title}
            text={topic.text}
            value={settings.topics[topic.key] ?? false}
            onChange={(next) => setTopic(topic.key, next)}
          />
        ))}
      </Group>

      <Group title="How to reach me">
        {CHANNELS.map((channel) => (
          <SwitchRow
            key={channel.key}
            title={channel.title}
            text={channel.text}
            value={settings.channels[channel.key] ?? false}
            onChange={(next) => setChannel(channel.key, next)}
          />
        ))}
      </Group>

      <View className="gap-2.5">
        <Text className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Appearance
        </Text>
        <SegmentedControl<ThemeChoice>
          value={settings.theme}
          onChange={setTheme}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </View>

      <Group title="Preferences">
        <Row
          icon={CalendarDays}
          title="Calendar"
          text={
            calendar.connected
              ? 'Connected. Reminders can show in your calendar.'
              : 'Add your reminders to your calendar'
          }
          onPress={() => setCalendarOpen(true)}
        />
        <Row
          icon={Languages}
          title="Language and lifestyle"
          text="Languages, smoking and alcohol"
          onPress={() => go('/details/preferences')}
        />
      </Group>

      <Group title="About">
        <Row
          icon={LockKeyhole}
          title="Privacy policy"
          onPress={() => Linking.openURL(PRIVACY_URL)}
        />
        <Row
          icon={ScrollText}
          title="Terms of service"
          onPress={() => Linking.openURL(TERMS_URL)}
        />
        <Row
          icon={LogOut}
          title="Sign out"
          text="You can sign back in with your PIN"
          danger
          onPress={() => router.replace('/auth/login')}
        />
      </Group>

      <Text className="text-center text-xs text-muted-foreground">
        {`NairaClinic ${Constants.expoConfig?.version ?? ''}`.trim()}
      </Text>

      <ChangePinSheet
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onChanged={() => setPinDone(true)}
      />
      <CalendarPromptSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </View>
  );
}
