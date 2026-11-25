import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { biometricLabel, biometricSupport, type BiometricKind } from '@/lib/auth/biometrics';
import { signOut, unlockSession } from '@/lib/auth/session';
import { Fingerprint, ScanFace } from 'lucide-react-native';
import * as React from 'react';
import { Image, Keyboard, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('@assets/images/logo.png');

// Covers the whole app while it is locked. Asks for Face ID or fingerprint as soon as it shows.
export function UnlockScreen() {
  const insets = useSafeAreaInsets();
  const [kind, setKind] = React.useState<BiometricKind>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const asking = React.useRef(false);

  const unlock = React.useCallback(async () => {
    if (asking.current) return;
    asking.current = true;
    setBusy(true);
    setError(null);
    const result = await unlockSession();
    asking.current = false;
    setBusy(false);
    if (!result.ok && result.error) setError(result.error);
  }, []);

  React.useEffect(() => {
    Keyboard.dismiss();
    biometricSupport().then((support) => setKind(support.kind));
    unlock();
  }, [unlock]);

  const label = biometricLabel(kind);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 },
      ]}
      className="justify-between bg-background"
      accessibilityViewIsModal>
      <View className="items-center gap-4" style={{ paddingHorizontal: SCREEN_PADDING_X }}>
        <Image source={LOGO} style={{ width: 72, height: 72 }} resizeMode="contain" />
        <Text className="text-center text-2xl font-extrabold">NairaClinic is locked</Text>
        <Text className="text-center text-sm leading-5 text-muted-foreground">
          {`Use ${label} to open your account.`}
        </Text>
        {error ? <Text className="text-center text-[13px] text-destructive">{error}</Text> : null}
      </View>

      <View className="gap-3" style={{ paddingHorizontal: SCREEN_PADDING_X }}>
        <Button size="lg" loading={busy} onPress={unlock}>
          <Icon
            as={kind === 'face' ? ScanFace : Fingerprint}
            className="size-5 text-primary-foreground"
          />
          <Text className="text-base">{`Unlock with ${label}`}</Text>
        </Button>
        <Button variant="link" onPress={() => signOut()}>
          <Text className="text-[14px] font-bold">Log in with PIN instead</Text>
        </Button>
      </View>
    </View>
  );
}
