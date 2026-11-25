import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatNaira, formatWhen } from '@/features/orders/utils';
import { cn } from '@/lib/utils';
import { router } from 'expo-router';
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
import { BigNaira } from './wallet-card';
import { useWallet } from '../store';

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
      className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-card">
      <Icon as={icon} className="size-4.5 text-foreground" />
      <Text className="text-[13px] font-semibold">{label}</Text>
    </PressableScale>
  );
}

function MonthTile({ label, kobo, tone }: { label: string; kobo: number; tone: 'in' | 'out' }) {
  return (
    <View className="flex-1 gap-1 rounded-2xl bg-card p-3.5">
      <View className="flex-row items-center gap-1.5">
        <Icon
          as={tone === 'in' ? ArrowDownLeft : ArrowUpRight}
          className="size-3.5 text-muted-foreground"
        />
        <Text className="text-xs text-muted-foreground">{label}</Text>
      </View>
      <Text className={cn('text-xl font-extrabold', tone === 'in' && 'text-primary')}>
        {formatNaira(kobo)}
      </Text>
    </View>
  );
}

export function WalletView() {
  const { wallet, coins, history } = useWallet();
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const month = history.filter((entry) => new Date(entry.at) >= start);
  const sum = (direction: 'in' | 'out') =>
    month
      .filter((entry) => entry.direction === direction)
      .reduce((total, entry) => total + entry.amountKobo, 0);

  return (
    <View className="gap-5">
      <View className="gap-2.5 rounded-2xl bg-primary px-3.5 py-3">
        <View className="flex-row items-center justify-between gap-3">
          <View>
            <Text className="text-[11px] font-semibold text-primary-foreground/80">Balance</Text>
            <BigNaira
              kobo={wallet.balanceKobo}
              className="text-2xl leading-8 font-extrabold text-primary-foreground"
            />
          </View>
          <View className="items-end">
            <Text className="text-[11px] text-primary-foreground/80">Account number</Text>
            <View className="flex-row items-center gap-2">
              <Text
                selectable
                className="text-base font-extrabold tracking-[1px] text-primary-foreground">
                {wallet.accountNumber}
              </Text>
              <PressableScale
                scaleTo={0.9}
                role="button"
                accessibilityLabel="Share account number"
                onPress={() => Share.share({ message: wallet.accountNumber })}
                className="size-7 items-center justify-center rounded-full bg-white/20">
                <Icon as={Share2} className="size-3.5 text-primary-foreground" />
              </PressableScale>
            </View>
          </View>
        </View>
        <Text className="text-[11px] text-primary-foreground/75" numberOfLines={1}>
          {`${wallet.accountName} · ${wallet.bankName}`}
        </Text>
      </View>

      <View className="flex-row gap-2.5">
        <Chip
          icon={Coins}
          label={`${coins.toLocaleString('en-NG')} coins`}
          onPress={() => router.push('/refer')}
        />
        <Chip
          icon={CreditCard}
          label="Saved cards"
          onPress={() => router.push('/payment-methods')}
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
            <Icon as={ArrowDownUp} className="size-3.5 text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">{`${history.length} in total`}</Text>
          </View>
        </View>
        <View className="overflow-hidden rounded-2xl bg-card">
          {history.length ? (
            history.map((entry, index) => (
              <View
                key={entry.id}
                className={cn(
                  'flex-row items-center gap-3 px-3.5 py-3',
                  index > 0 && 'border-t border-border'
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
                  <Text className="text-xs text-muted-foreground">{formatWhen(entry.at)}</Text>
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
              <Icon as={Landmark} className="size-5 text-primary" />
              <Text className="text-center text-xs text-muted-foreground">
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
