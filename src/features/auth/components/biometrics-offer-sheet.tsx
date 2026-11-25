import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  biometricLabel,
  closeBiometricsOffer,
  useBiometricsOffer,
} from '@/lib/auth/offer-biometrics';
import { enableBiometrics } from '@/lib/auth/session';
import * as Haptics from 'expo-haptics';
import { Fingerprint, ScanFace } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

// Offered once after the first login on a phone that has Face ID or fingerprint.
export function BiometricsOfferSheet() {
  const { open, kind } = useBiometricsOffer();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const label = biometricLabel(kind);

  React.useEffect(() => {
    if (open) setError(null);
  }, [open]);

  async function turnOn() {
    setBusy(true);
    setError(null);
    const result = await enableBiometrics();
    setBusy(false);
    if (result.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeBiometricsOffer();
    } else if (result.error) setError(result.error);
  }

  return (
    <Sheet
      open={open}
      onClose={closeBiometricsOffer}
      title={`Open with ${label} next time?`}
      subtitle={`Skip typing your PIN. NairaClinic locks itself after a minute away and opens with ${label}.`}
      footer={
        <View className="gap-2">
          {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
          <View className="flex-row gap-2">
            <ActionButton
              size="md"
              label="Not now"
              variant="outline"
              className="flex-1"
              disabled={busy}
              onPress={closeBiometricsOffer}
            />
            <ActionButton
              size="md"
              label={busy ? 'Waiting…' : `Turn on ${label}`}
              className="flex-[2]"
              disabled={busy}
              onPress={turnOn}
            />
          </View>
        </View>
      }>
      <View className="items-center py-2">
        <View className="size-20 items-center justify-center rounded-full bg-secondary">
          <Icon as={kind === 'face' ? ScanFace : Fingerprint} className="size-10 text-primary" />
        </View>
      </View>
    </Sheet>
  );
}
