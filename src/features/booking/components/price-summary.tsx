import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';
import { naira } from '../utils';

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className={cn('text-[13px]', strong ? 'font-bold' : 'text-muted-foreground')}>
        {label}
      </Text>
      <Text className={cn('text-[13px]', strong ? 'font-extrabold' : 'font-medium')}>{value}</Text>
    </View>
  );
}

type PriceSummaryProps = {
  label: string;
  feeNgn: number;
  serviceFeeNgn: number;
  included: boolean;
  promo: string;
  onPromo: (code: string) => void;
  allowPromo: boolean;
};

export function totalOf(feeNgn: number, serviceFeeNgn: number, included: boolean) {
  return included ? 0 : feeNgn + serviceFeeNgn;
}

export function PriceSummary({
  label,
  feeNgn,
  serviceFeeNgn,
  included,
  promo,
  onPromo,
  allowPromo,
}: PriceSummaryProps) {
  return (
    <View className="gap-4 rounded-2xl bg-card p-4">
      <Text className="text-[15px] font-bold">Price breakdown</Text>
      <View className="gap-2.5 rounded-xl bg-muted p-3.5">
        <Line label={label} value={included ? 'Included' : naira(feeNgn)} />
        <Line label="Service fee" value={included ? 'Included' : naira(serviceFeeNgn)} />
        <View className="h-px bg-border" />
        <Line strong label="Total today" value={naira(totalOf(feeNgn, serviceFeeNgn, included))} />
      </View>

      {allowPromo && !included ? (
        <View className="gap-1.5">
          <TextField
            label="Promo code (optional)"
            tone="muted"
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Enter code"
            value={promo}
            onChangeText={(value) => onPromo(value.toUpperCase().trim())}
          />
          <Text className="text-xs leading-4.5 text-muted-foreground">
            Your code is checked when you pay, and the discount comes off the doctor's fee.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
