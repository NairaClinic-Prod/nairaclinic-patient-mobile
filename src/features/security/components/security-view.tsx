import { ActionButton } from '@/components/shared/action-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
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
import { PRIVACY_URL, TERMS_URL } from '@/constants/links';
import { PIN_LENGTH } from '../constants';
import { addDevice, removeDevice, useDevices } from '../store';
import { ChangePinSheet } from './change-pin-sheet';

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
    <View className="gap-3 rounded-3xl bg-card p-4">
      <View className="size-10 items-center justify-center rounded-full bg-secondary">
        <Icon as={icon} className="size-5 text-primary" />
      </View>
      <View className="gap-1">
        <Text className="text-[15px] font-bold">{title}</Text>
        <Text className="text-xs leading-4.5 text-muted-foreground">{text}</Text>
      </View>
      {children}
    </View>
  );
}

function PinCard() {
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);

  return (
    <InfoCard
      icon={KeyRound}
      title="Sign-in PIN"
      text={`Your ${PIN_LENGTH}-digit PIN signs you in. Change it any time; this signs out your other devices.`}>
      {done ? (
        <Text className="text-xs font-medium text-success">
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
      <ChangePinSheet open={open} onClose={() => setOpen(false)} onChanged={() => setDone(true)} />
    </InfoCard>
  );
}

function BiometricCard() {
  const { devices } = useDevices();

  return (
    <InfoCard
      icon={Fingerprint}
      title="Fingerprint or Face ID"
      text="Sign in with your fingerprint or face instead of typing your PIN. It works on the devices you turn it on for.">
      {devices.map((device) => (
        <View key={device.id} className="flex-row items-center gap-3 rounded-2xl bg-muted p-3">
          <Icon as={Smartphone} className="size-5 text-primary" />
          <View className="min-w-0 flex-1">
            <Text className="text-[13px] font-semibold" numberOfLines={1}>
              {device.deviceName}
            </Text>
            <Text className="text-[11px] text-muted-foreground">
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
      <Text className="text-xs leading-4.5 text-muted-foreground">
        {'Read how we handle your data in our '}
        <Text
          className="text-xs font-semibold text-primary"
          onPress={() => Linking.openURL(PRIVACY_URL)}>
          Privacy Policy
        </Text>
        {' and the '}
        <Text
          className="text-xs font-semibold text-primary"
          onPress={() => Linking.openURL(TERMS_URL)}>
          Terms of Service
        </Text>
        .
      </Text>
    </View>
  );
}
