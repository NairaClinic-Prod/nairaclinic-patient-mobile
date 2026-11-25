import { ActionButton } from '@/components/shared/action-button';
import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import type { Promo } from '../types';
import { findPromo, naira } from '../utils';

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
  promo: Promo | null;
  onPromo: (promo: Promo | null) => void;
  allowPromo: boolean;
};

export function totalOf(
  feeNgn: number,
  serviceFeeNgn: number,
  included: boolean,
  promo: Promo | null
) {
  if (included) return 0;
  return Math.max(0, feeNgn + serviceFeeNgn - (promo?.discountNgn ?? 0));
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
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');

  function apply() {
    const found = findPromo(code);
    if (!found) {
      setError('That code is not valid.');
      return;
    }
    setError('');
    onPromo(found);
  }

  return (
    <View className="gap-4 rounded-2xl bg-card p-4">
      <Text className="text-[15px] font-bold">Price breakdown</Text>
      <View className="gap-2.5 rounded-xl bg-muted p-3.5">
        <Line label={label} value={included ? 'Included' : naira(feeNgn)} />
        <Line label="Service fee" value={included ? 'Included' : naira(serviceFeeNgn)} />
        {promo && !included ? (
          <Line label={`Discount · ${promo.code}`} value={`−${naira(promo.discountNgn)}`} />
        ) : null}
        <View className="h-px bg-border" />
        <Line
          strong
          label="Total today"
          value={naira(totalOf(feeNgn, serviceFeeNgn, included, promo))}
        />
      </View>

      {allowPromo && !included ? (
        <View className="gap-2">
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <TextField
                label="Promo code"
                tone="muted"
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="Enter code"
                value={code}
                onChangeText={(value) => {
                  setCode(value.toUpperCase());
                  setError('');
                  if (promo) onPromo(null);
                }}
              />
            </View>
            <ActionButton
              size="md"
              variant="outline"
              label="Apply"
              disabled={!code.trim()}
              onPress={apply}
            />
          </View>
          {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
          {promo ? (
            <Text className="text-xs font-medium text-success">{`${promo.description} applied · ${naira(promo.discountNgn)} off`}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
