import { ActionButton } from '@/components/patterns/action-button';
import { Sheet } from '@/components/patterns/sheet';
import { TextField } from '@/components/patterns/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import {
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Linking, View } from 'react-native';
import { PIN_LENGTH, PRIVACY_URL, TERMS_URL } from '../constants';
import { addDevice, removeDevice, useProfile } from '../hooks/use-profile';

const digits = (value: string) => value.replace(/\D/g, '').slice(0, PIN_LENGTH);
const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function InfoCard({
  icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="bg-card gap-3 rounded-3xl p-4">
      <View className="bg-secondary size-10 items-center justify-center rounded-full">
        <Icon as={icon} className="text-primary size-5" />
      </View>
      <View className="gap-1">
        <Text className="text-[15px] font-bold">{title}</Text>
        <Text className="text-muted-foreground text-xs leading-4.5">{text}</Text>
      </View>
      {children}
    </View>
  );
}

function PinCard() {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [done, setDone] = React.useState(false);

  const missing = [
    ...(current.length === PIN_LENGTH ? [] : ['Your current PIN']),
    ...(next.length === PIN_LENGTH ? [] : [`A new ${PIN_LENGTH}-digit PIN`]),
    ...(next.length === PIN_LENGTH && current === next
      ? ['A PIN different from your current one']
      : []),
    ...(next.length === PIN_LENGTH && confirm !== next ? ['The same new PIN again'] : []),
  ];

  function close() {
    setOpen(false);
    setCurrent('');
    setNext('');
    setConfirm('');
  }

  const pin = (label: string, value: string, set: (value: string) => void) => (
    <TextField
      sheet
      tone="muted"
      label={label}
      secureTextEntry
      keyboardType="number-pad"
      maxLength={PIN_LENGTH}
      placeholder="•••••"
      value={value}
      onChangeText={(text) => set(digits(text))}
    />
  );

  return (
    <InfoCard
      icon={KeyRound}
      title="Sign-in PIN"
      text={`Your ${PIN_LENGTH}-digit PIN signs you in. Change it any time; this signs out your other devices.`}>
      {done ? (
        <Text className="text-success text-xs font-medium">
          PIN changed. Other devices have been signed out.
        </Text>
      ) : null}
      <ActionButton
        label="Change PIN"
        icon={KeyRound}
        variant="outline"
        className="self-start"
        onPress={() => {
          setDone(false);
          setOpen(true);
        }}
      />
      <Sheet
        open={open}
        onClose={close}
        title="Change your PIN"
        subtitle={`Enter your current PIN, then choose a new ${PIN_LENGTH}-digit PIN.`}
        snapPoints={['70%']}
        footer={
          <View className="gap-2">
            {missing.length ? (
              <Text className="text-muted-foreground text-xs">{`Still needed: ${missing.join(', ')}.`}</Text>
            ) : null}
            <View className="flex-row gap-2">
              <ActionButton
                size="md"
                label="Cancel"
                variant="outline"
                className="flex-1"
                onPress={close}
              />
              <ActionButton
                size="md"
                label="Change PIN"
                className="flex-[2]"
                disabled={missing.length > 0}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setDone(true);
                  close();
                }}
              />
            </View>
          </View>
        }>
        <View className="gap-3.5">
          {pin('Current PIN', current, setCurrent)}
          {pin('New PIN', next, setNext)}
          {pin('Confirm new PIN', confirm, setConfirm)}
        </View>
      </Sheet>
    </InfoCard>
  );
}

function BiometricCard() {
  const { devices } = useProfile();

  return (
    <InfoCard
      icon={Fingerprint}
      title="Fingerprint or Face ID"
      text="Sign in with your fingerprint or face instead of typing your PIN. It works on the devices you turn it on for.">
      {devices.map((device) => (
        <View key={device.id} className="bg-muted flex-row items-center gap-3 rounded-2xl p-3">
          <Icon as={Smartphone} className="text-primary size-5" />
          <View className="min-w-0 flex-1">
            <Text className="text-[13px] font-semibold" numberOfLines={1}>
              {device.deviceName}
            </Text>
            <Text className="text-muted-foreground text-[11px]">
              {`Added ${DATE.format(new Date(device.createdAt))}${
                device.lastUsedAt ? ` · Last used ${DATE.format(new Date(device.lastUsedAt))}` : ''
              }`}
            </Text>
          </View>
          <ActionButton
            icon={Trash2}
            variant="danger"
            accessibilityLabel={`Remove ${device.deviceName}`}
            onPress={() => removeDevice(device.id)}
          />
        </View>
      ))}
      <ActionButton
        label={devices.length ? 'Add this device' : 'Turn on for this device'}
        icon={Fingerprint}
        variant="outline"
        className="self-start"
        onPress={addDevice}
      />
    </InfoCard>
  );
}

export function SecurityView() {
  return (
    <View className="gap-4">
      <PinCard />
      <BiometricCard />
      <InfoCard
        icon={ShieldCheck}
        title="Account authentication"
        text="Your session and identity are protected by your NairaClinic sign-in."
      />
      <InfoCard
        icon={ShieldCheck}
        title="Medical record privacy"
        text="Subscriptions and family membership never grant automatic access to clinical records."
      />
      <Text className="text-muted-foreground text-xs leading-4.5">
        {'Read how we handle your data in our '}
        <Text
          className="text-primary text-xs font-semibold"
          onPress={() => Linking.openURL(PRIVACY_URL)}>
          Privacy Policy
        </Text>
        {' and the '}
        <Text
          className="text-primary text-xs font-semibold"
          onPress={() => Linking.openURL(TERMS_URL)}>
          Terms of Service
        </Text>
        .
      </Text>
    </View>
  );
}
