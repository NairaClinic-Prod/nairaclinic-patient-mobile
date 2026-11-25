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
import { biometricLabel, biometricSupport, type BiometricSupport } from '@/lib/auth/biometrics';
import { disableBiometrics, enableBiometrics, useSession } from '@/lib/auth/session';
import { ChangePinSheet } from './change-pin-sheet';

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

// Face ID or fingerprint only guards this phone, so the card shows just this device.
function BiometricCard() {
  const { biometrics } = useSession();
  const [support, setSupport] = React.useState<BiometricSupport | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    biometricSupport().then(setSupport);
  }, []);

  const label = biometricLabel(support?.kind ?? null);

  async function toggle() {
    setError(null);
    if (biometrics) {
      await disableBiometrics();
      return;
    }
    setBusy(true);
    const result = await enableBiometrics();
    setBusy(false);
    if (!result.ok && result.error) setError(result.error);
  }

  return (
    <InfoCard
      icon={Fingerprint}
      title="Fingerprint or Face ID"
      text="Open NairaClinic with your fingerprint or face instead of typing your PIN. The app also locks after a minute away.">
      <View className="flex-row items-center gap-3 rounded-2xl bg-muted p-3">
        <Icon as={Smartphone} className="size-5 text-primary" />
        <View className="min-w-0 flex-1">
          <Text className="text-[13px] font-semibold" numberOfLines={1}>
            This phone
          </Text>
          <Text className="text-[11px] text-muted-foreground">
            {support && !support.available
              ? 'Set up Face ID or fingerprint in your phone settings first.'
              : biometrics
                ? `On · unlocks with ${label}`
                : 'Off'}
          </Text>
        </View>
      </View>
      {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
      {support?.available ? (
        <ActionButton
          label={biometrics ? 'Turn off' : busy ? 'Waiting…' : `Turn on ${label}`}
          icon={biometrics ? Trash2 : Fingerprint}
          variant={biometrics ? 'danger' : 'outline'}
          className="self-start"
          disabled={busy}
          onPress={toggle}
        />
      ) : null}
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
