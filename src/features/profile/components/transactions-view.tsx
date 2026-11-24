import { EmptyState } from '@/components/shared/empty-state';
import { StatTile } from '@/components/shared/stat-tile';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatNaira } from '@/features/orders/utils';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  FileText,
  FlaskConical,
  Pill,
  ReceiptText,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';
import { KIND_LABEL } from '../constants';
import { useProfile } from '../hooks/use-profile';
import type { TransactionKind } from '../types';

const ICON: Record<TransactionKind, LucideIcon> = {
  consultation: Stethoscope,
  pharmacy: Pill,
  subscription: CreditCard,
  doctor_plan: Stethoscope,
  credits: ReceiptText,
  community: Users,
  files: FileText,
  other: FlaskConical,
};

const STAMP = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function TransactionsView() {
  const { transactions } = useProfile();
  const total = transactions
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + item.amountKobo, 0);

  return (
    <View className="gap-5">
      <View className="flex-row gap-2.5">
        <StatTile label="Total paid" value={formatNaira(total)} icon={ReceiptText} tone="mint" />
        <StatTile label="Payments" value={transactions.length} icon={CreditCard} tone="teal" />
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold">
          {'History '}
          <Text className="text-muted-foreground text-base font-normal">{transactions.length}</Text>
        </Text>
        <View className="bg-card overflow-hidden rounded-2xl">
          {transactions.length ? (
            transactions.map((item, index) => {
              const refunded = item.status === 'refunded';
              return (
                <View
                  key={item.id}
                  className={cn(
                    'border-border flex-row items-center gap-3 px-3.5 py-3',
                    index < transactions.length - 1 ? 'border-b' : ''
                  )}>
                  <View className="bg-secondary size-10 items-center justify-center rounded-xl">
                    <Icon as={ICON[item.kind]} className="text-primary size-4" />
                  </View>
                  <View className="min-w-0 flex-1 gap-0.5">
                    <Text className="text-[13px] leading-4.5 font-bold">{item.title}</Text>
                    <Text className="text-muted-foreground text-[11px]" numberOfLines={1}>
                      {`Ref ${item.reference}${item.detail && item.kind === 'pharmacy' ? ` · ${item.detail}` : ''}`}
                    </Text>
                    <Text className="text-muted-foreground text-[11px]">
                      {`${KIND_LABEL[item.kind]} · ${STAMP.format(new Date(item.at))}`}
                    </Text>
                  </View>
                  <View className="items-end gap-1">
                    <Text
                      className={cn(
                        'text-[13px] font-extrabold',
                        refunded ? 'text-muted-foreground line-through' : undefined
                      )}>
                      {formatNaira(item.amountKobo)}
                    </Text>
                    <View
                      className={cn(
                        'rounded-full px-2 py-0.5',
                        refunded ? 'bg-muted' : 'bg-secondary'
                      )}>
                      <Text
                        className={cn(
                          'text-[10px] font-bold',
                          refunded ? 'text-muted-foreground' : 'text-success'
                        )}>
                        {refunded ? 'Refunded' : 'Paid'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <EmptyState
              icon={ReceiptText}
              text="No payments yet. Once you pay for a consultation or an order, it shows up here."
            />
          )}
        </View>
      </View>
    </View>
  );
}
