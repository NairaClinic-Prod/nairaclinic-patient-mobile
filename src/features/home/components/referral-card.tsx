import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Check, Copy, Heart, Link2 } from 'lucide-react-native';
import * as React from 'react';
import { Share, View } from 'react-native';
import type { ReferralLink } from '../types';

export function ReferralCard({ referral }: { referral: ReferralLink }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    await Clipboard.setStringAsync(referral.code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
  }

  return (
    <View
      className="gap-3 rounded-3xl bg-secondary p-4"
      style={{ marginHorizontal: SCREEN_PADDING_X }}>
      <View className="flex-row items-center gap-2.5">
        <View className="size-10 items-center justify-center rounded-full bg-card">
          <Icon as={Heart} className="size-4 text-primary" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-secondary-foreground">
            Good care is worth sharing.
          </Text>
          <Text className="mt-0.5 text-[11px] text-muted-foreground">
            Invite friends and family. Earn coins for care.
          </Text>
        </View>
      </View>
      <View className="h-10 items-center justify-center rounded-2xl bg-card">
        <Text className="text-sm font-bold tracking-widest">{referral.code}</Text>
      </View>
      <View className="flex-row gap-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-2xl"
          accessibilityLabel="Copy referral code"
          onPress={copy}>
          <Icon as={copied ? Check : Copy} className="size-3.5" />
          <Text>{copied ? 'Copied' : 'Copy code'}</Text>
        </Button>
        <Button
          size="sm"
          variant="default"
          className="flex-1 rounded-2xl"
          onPress={() => Share.share({ message: referral.shareUrl })}>
          <Icon as={Link2} className="size-3.5 text-primary-foreground" />
          <Text>Share link</Text>
        </Button>
      </View>
    </View>
  );
}
