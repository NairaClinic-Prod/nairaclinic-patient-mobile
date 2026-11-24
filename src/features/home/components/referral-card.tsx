import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { Heart, Link2, Share2 } from 'lucide-react-native';
import { Share, View } from 'react-native';
import type { ReferralLink } from '../types';

export function ReferralCard({ referral }: { referral: ReferralLink }) {
  return (
    <View
      className="bg-secondary gap-3 rounded-3xl p-4"
      style={{ marginHorizontal: SCREEN_PADDING_X }}>
      <View className="flex-row items-center gap-2.5">
        <View className="bg-card size-10 items-center justify-center rounded-full">
          <Icon as={Heart} className="text-primary size-4" />
        </View>
        <View className="flex-1">
          <Text className="text-secondary-foreground text-sm font-bold">
            Good care is worth sharing.
          </Text>
          <Text className="text-muted-foreground mt-0.5 text-[11px]">
            Invite friends and family. Earn coins for care.
          </Text>
        </View>
      </View>
      <View className="bg-card h-10 items-center justify-center rounded-2xl">
        <Text className="text-sm font-bold tracking-widest">{referral.code}</Text>
      </View>
      <View className="flex-row gap-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-2xl"
          onPress={() => Share.share({ message: referral.code })}>
          <Icon as={Share2} className="size-3.5" />
          <Text>Share code</Text>
        </Button>
        <Button
          size="sm"
          variant="default"
          className="flex-1 rounded-2xl"
          onPress={() => Share.share({ message: referral.shareUrl })}>
          <Icon as={Link2} className="text-primary-foreground size-3.5" />
          <Text>Share link</Text>
        </Button>
      </View>
    </View>
  );
}
