import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { closeSignOutConfirm, useSignOutConfirm } from '@/features/auth/sign-out-confirm';
import { signOut, useSession } from '@/lib/auth/session';
import * as Haptics from 'expo-haptics';
import { LogOut } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

// Every sign-out button opens this first, so nobody is logged out by a stray tap.
export function SignOutSheet() {
  const { open } = useSignOutConfirm();
  const { biometrics } = useSession();
  const [busy, setBusy] = React.useState(false);

  async function confirm() {
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await signOut();
    } finally {
      setBusy(false);
      closeSignOutConfirm();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        if (!busy) closeSignOutConfirm();
      }}
      title="Sign out of NairaClinic?"
      subtitle="You can log back in any time with your phone number and PIN."
      footer={
        <View className="flex-row gap-2">
          <ActionButton
            size="md"
            label="Stay signed in"
            variant="outline"
            className="flex-1"
            disabled={busy}
            onPress={closeSignOutConfirm}
          />
          <ActionButton
            size="md"
            label={busy ? 'Signing out…' : 'Sign out'}
            icon={LogOut}
            variant="danger"
            className="flex-1"
            disabled={busy}
            onPress={confirm}
          />
        </View>
      }>
      <View className="items-center gap-3 py-2">
        <View className="size-20 items-center justify-center rounded-full bg-destructive/10">
          <Icon as={LogOut} className="size-9 text-destructive" />
        </View>
        {biometrics ? (
          <Text className="text-center text-xs leading-4.5 text-muted-foreground">
            Face ID and fingerprint sign-in will be turned off on this phone.
          </Text>
        ) : null}
      </View>
    </Sheet>
  );
}
