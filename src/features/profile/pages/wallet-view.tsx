import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatNaira, formatWhen } from '@/features/orders/utils';
import { cn } from '@/lib/utils';
import { router, type Href } from 'expo-router';
import {
  ArrowDownLeft,
  ArrowDownUp,
  ArrowUpRight,
  Coins,
  CreditCard,
  Landmark,
  Share2,
} from 'lucide-react-native';
import { Share, View } from 'react-native';
import { BigNaira } from '../components/wallet-card';
import { useProfile } from '../hooks/use-profile';
import { WALLET_COINS, WALLET_HISTORY } from '../pages-data';

function Chip({
  icon,
  label,
  onPress,
}: {
  icon: typeof Coins;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      scaleTo={0.97}
      role="button"
      onPress={onPress}
      className="bg-card h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full">
      <Icon as={icon} className="text-foreground size-4.5" />
      <Text className="text-[13px] font-semibold">{label}</Text>
    </PressableScale>
  );
}

function MonthTile({ label, kobo, tone }: { label: string; kobo: number; tone: 'in' | 'out' }) {
  return (
    <View className="bg-card flex-1 gap-1 rounded-2xl p-3.5">
      <View className="flex-row items-center gap-1.5">
        <Icon
          as={tone === 'in' ? ArrowDownLeft : ArrowUpRight}
          className="text-muted-foreground size-3.5"
        />
        <Text className="text-muted-foreground text-xs">{label}</Text>
      </View>
      <Text className={cn('text-xl font-extrabold', tone === 'in' && 'text-primary')}>
        {formatNaira(kobo)}
      </Text>
    </View>
  );
}

export function WalletView() {
  const { wallet } = useProfile();
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const month = WALLET_HISTORY.filter((entry) => new Date(entry.at) >= start);
  const sum = (direction: 'in' | 'out') =>
    month
      .filter((entry) => entry.direction === direction)
      .reduce((total, entry) => total + entry.amountKobo, 0);

  return (
    <View className="gap-5">
      <View className="bg-primary gap-5 overflow-hidden rounded-3xl p-5">
        <View
          pointerEvents="none"
          className="absolute -right-10 -bottom-12 size-44 rounded-full bg-white/10"
        />
        <View className="items-center gap-1">
          <Text className="text-primary-foreground/80 text-[13px] font-semibold">Balance</Text>
          <BigNaira
            kobo={wallet.balanceKobo}
            className="text-primary-foreground text-[40px] leading-[46px] font-extrabold"
          />
          <Text className="text-primary-foreground/75 text-xs">
            For visits, medicines and plans
          </Text>
        </View>
        <View className="gap-1.5 rounded-2xl bg-white/15 p-4">
          <Text className="text-primary-foreground/80 text-xs">Add money by bank transfer</Text>
          <View className="flex-row items-center justify-between gap-3">
            <Text
              selectable
              className="text-primary-foreground text-[26px] font-extrabold tracking-[1.5px]">
              {wallet.accountNumber}
            </Text>
            <PressableScale
              scaleTo={0.94}
              role="button"
              onPress={() => Share.share({ message: wallet.accountNumber })}
              className="h-10 flex-row items-center gap-1.5 rounded-full bg-white/20 px-4">
              <Icon as={Share2} className="text-primary-foreground size-4" />
              <Text className="text-primary-foreground text-[13px] font-bold">Share</Text>
            </PressableScale>
          </View>
          <Text className="text-primary-foreground/80 text-xs" numberOfLines={1}>
            {`${wallet.accountName} · ${wallet.bankName}`}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2.5">
        <Chip
          icon={Coins}
          label={`${WALLET_COINS.toLocaleString('en-NG')} coins`}
          onPress={() => router.push('/account/refer' as Href)}
        />
        <Chip
          icon={CreditCard}
          label="Saved cards"
          onPress={() => router.push('/account/payment-methods' as Href)}
        />
      </View>

      <View className="flex-row gap-2.5">
        <MonthTile label="In this month" kobo={sum('in')} tone="in" />
        <MonthTile label="Out this month" kobo={sum('out')} tone="out" />
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-extrabold">Recent transactions</Text>
          <View className="flex-row items-center gap-1">
            <Icon as={ArrowDownUp} className="text-muted-foreground size-3.5" />
            <Text className="text-muted-foreground text-xs">{`${WALLET_HISTORY.length} in total`}</Text>
          </View>
        </View>
        <View className="bg-card overflow-hidden rounded-2xl">
          {WALLET_HISTORY.length ? (
            WALLET_HISTORY.map((entry, index) => (
              <View
                key={entry.id}
                className={cn(
                  'flex-row items-center gap-3 px-3.5 py-3',
                  index > 0 && 'border-border border-t'
                )}>
                <View
                  className={cn(
                    'size-10 items-center justify-center rounded-full',
                    entry.direction === 'in' ? 'bg-secondary' : 'bg-muted'
                  )}>
                  <Icon
                    as={entry.direction === 'in' ? ArrowDownLeft : ArrowUpRight}
                    className={cn(
                      'size-4.5',
                      entry.direction === 'in' ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-[14px] font-semibold" numberOfLines={1}>
                    {entry.title}
                  </Text>
                  <Text className="text-muted-foreground text-xs">{formatWhen(entry.at)}</Text>
                </View>
                <Text
                  className={cn(
                    'text-[14px] font-bold',
                    entry.direction === 'in' && 'text-primary'
                  )}>
                  {`${entry.direction === 'in' ? '+' : '−'}${formatNaira(entry.amountKobo)}`}
                </Text>
              </View>
            ))
          ) : (
            <View className="items-center gap-2 px-6 py-10">
              <Icon as={Landmark} className="text-primary size-5" />
              <Text className="text-muted-foreground text-center text-xs">
                No transactions yet. Add money by bank transfer and it shows here the moment it
                lands.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
