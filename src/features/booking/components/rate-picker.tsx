import { Choosable } from '@/components/shared/choosable';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import type { Rate } from '../types';
import { naira } from '../utils';

type RatePickerProps = {
  rates: Rate[];
  selected: number | null;
  included?: boolean;
  onChange: (index: number) => void;
};

export function RatePicker({ rates, selected, included, onChange }: RatePickerProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {rates.map((rate, index) => (
        <View key={`${rate.durationMins}-${index}`} className="w-[47.5%] grow">
          <Choosable
            selected={selected === index}
            label={`${rate.durationMins} minutes`}
            onPress={() => onChange(index)}>
            {rate.label ? (
              <Text className="mb-1.5 text-[10px] font-extrabold tracking-wider text-warning uppercase">
                {rate.label}
              </Text>
            ) : null}
            <Text className="text-lg font-bold">{`${rate.durationMins} mins`}</Text>
            <Text className="text-[15px] font-semibold text-primary">
              {included ? 'Included' : naira(rate.amountNgn)}
            </Text>
            {included ? null : (
              <Text className="mt-0.5 text-xs text-muted-foreground">
                {`${naira(Math.round(rate.amountNgn / rate.durationMins))}/min`}
              </Text>
            )}
          </Choosable>
        </View>
      ))}
    </View>
  );
}
