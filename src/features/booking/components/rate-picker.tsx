import { Choosable } from '@/components/shared/choosable';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import type { Rate } from '../types';
import { naira } from '../utils';
import { PairRows } from './pair-rows';

type RatePickerProps = {
  rates: Rate[];
  selected: number | null;
  included?: boolean;
  onChange: (index: number) => void;
};

export function RatePicker({ rates, selected, included, onChange }: RatePickerProps) {
  return (
    <PairRows>
      {rates.map((rate, index) => (
        <Choosable
          key={`${rate.durationMins}-${index}`}
          className="flex-1"
          selected={selected === index}
          label={`${rate.durationMins} minutes`}
          onPress={() => onChange(index)}>
          <View className="h-4 justify-center">
            {rate.label ? (
              <Text
                className="text-[10px] font-extrabold tracking-wider text-warning uppercase"
                numberOfLines={1}>
                {rate.label}
              </Text>
            ) : null}
          </View>
          <Text className="mt-1 text-lg font-bold">{`${rate.durationMins} mins`}</Text>
          <Text className="text-[15px] font-semibold text-primary">
            {included ? 'Included' : naira(rate.amountNgn)}
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {included ? ' ' : `${naira(Math.round(rate.amountNgn / rate.durationMins))}/min`}
          </Text>
        </Choosable>
      ))}
    </PairRows>
  );
}
