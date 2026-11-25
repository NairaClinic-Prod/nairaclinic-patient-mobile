import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronRight, Wallet } from 'lucide-react-native';
import { View } from 'react-native';
import { formatNaira } from '@/features/orders/utils';
import type { WalletInfo } from '../types';

export function BigNaira({ kobo, className }: { kobo: number; className?: string }) {
  const safe = Math.max(0, Math.round(kobo));
  const whole = `₦${Math.floor(safe / 100).toLocaleString('en-NG')}`;
  const fraction = `.${String(safe % 100).padStart(2, '0')}`;
  return (
    <Text className={className}>
      {whole}
      <Text className={`${className} opacity-60`}>{fraction}</Text>
    </Text>
  );
}

type WalletCardProps = { wallet: WalletInfo; onPress: () => void };

export function WalletCard({ wallet, onPress }: WalletCardProps) {
  return (
    <PressableScale
      scaleTo={0.98}
      role="button"
      accessibilityLabel={`Wallet balance ${formatNaira(wallet.balanceKobo)}. Open your wallet.`}
      onPress={onPress}
      className="flex-row items-center gap-3 overflow-hidden rounded-2xl bg-primary px-3.5 py-3">
      <View className="size-9 items-center justify-center rounded-full bg-white/15">
        <Icon as={Wallet} className="size-4.5 text-primary-foreground" />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-semibold text-primary-foreground/80">Wallet balance</Text>
        <BigNaira
          kobo={wallet.balanceKobo}
          className="text-xl leading-6 font-extrabold text-primary-foreground"
        />
      </View>
      <Icon as={ChevronRight} className="size-4.5 text-primary-foreground" />
    </PressableScale>
  );
}
