import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { RESEND_SECONDS } from '@/features/auth/constants';
import { useCountdown } from '@/features/auth/hooks/use-countdown';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

type CodeActionsProps = {
  disabled?: boolean;
  onResend: () => void | Promise<unknown>;
  onChangeNumber: () => void;
};

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Mount it when the code step opens: the first wait starts then, and every resend starts a new one.
// `disabled` only greys out Resend (for example while a full code is being checked). The spinner
// shows only while a resend itself is in flight.
export function CodeActions({ disabled, onResend, onChangeNumber }: CodeActionsProps) {
  const { remaining, restart } = useCountdown(RESEND_SECONDS);
  const [sending, setSending] = React.useState(false);
  const waiting = remaining > 0;

  // The wait only starts again once the code was really sent.
  async function resend() {
    setSending(true);
    try {
      await onResend();
      restart();
    } finally {
      setSending(false);
    }
  }

  return (
    <View className="h-9 flex-row items-center justify-center gap-4">
      <Button
        variant="link"
        size="sm"
        disabled={disabled || sending || waiting}
        onPress={resend}
        accessibilityState={{ busy: sending }}>
        {sending ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" />
            <Text className="text-[14px] font-bold">Sending…</Text>
          </View>
        ) : (
          <Text className="text-[14px] font-bold">
            {waiting ? `Resend code in ${formatTime(remaining)}` : 'Resend code'}
          </Text>
        )}
      </Button>
      <Button variant="link" size="sm" onPress={onChangeNumber}>
        <Text className="text-[14px] font-bold">Use a different number</Text>
      </Button>
    </View>
  );
}
