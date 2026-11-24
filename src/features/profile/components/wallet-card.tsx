import { PressableScale } from '@/components/patterns/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ArrowDownRight, ArrowUpRight, ChevronRight, Wallet } from 'lucide-react-native';
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
  const up = wallet.monthNetKobo >= 0;

  return (
    <PressableScale
      scaleTo={0.98}
      role="button"
      accessibilityLabel="Open your wallet and payment methods"
      onPress={onPress}
      className="bg-primary flex-row items-center gap-3.5 overflow-hidden rounded-3xl px-4 py-4">
      <View
        pointerEvents="none"
        className="absolute -top-10 -right-8 size-36 rounded-full bg-white/10"
      />
      <View className="size-11 items-center justify-center rounded-full bg-white/15">
        <Icon as={Wallet} className="text-primary-foreground size-5" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-primary-foreground/80 text-xs font-semibold">Wallet balance</Text>
        <BigNaira
          kobo={wallet.balanceKobo}
          className="text-primary-foreground text-[26px] leading-8 font-extrabold"
        />
        {wallet.monthNetKobo ? (
          <View className="flex-row items-center gap-1">
            <Icon
              as={up ? ArrowUpRight : ArrowDownRight}
              className="text-primary-foreground/85 size-3"
            />
            <Text className="text-primary-foreground/85 text-[11px] font-medium">
              {`${up ? '+' : '−'}${formatNaira(Math.abs(wallet.monthNetKobo))} this month`}
            </Text>
          </View>
        ) : (
          <Text className="text-primary-foreground/80 text-[11px]">
            For visits, medicines and plans
          </Text>
        )}
      </View>
      <Icon as={ChevronRight} className="text-primary-foreground size-5" />
    </PressableScale>
  );
}
