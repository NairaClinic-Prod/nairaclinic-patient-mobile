import { PressableScale } from '@/components/shared/pressable-scale';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { ScrollView } from 'react-native';
import type { DayOfSlots } from '../types';
import { dayParts } from '../utils';

type DayPickerProps = {
  days: DayOfSlots[];
  selected: string | null;
  onChange: (key: string) => void;
};

export function DayPicker({ days, selected, onChange }: DayPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2.5 px-4"
      className="-mx-4">
      {days.map((day) => {
        const active = selected === day.key;
        const parts = dayParts(day.date);
        return (
          <PressableScale
            key={day.key}
            scaleTo={0.95}
            role="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(day.key);
            }}
            className={cn(
              'min-w-[68px] items-center rounded-2xl border px-4 py-3',
              active ? 'border-primary bg-primary' : 'border-border bg-card'
            )}>
            <Text
              className={cn(
                'text-xs font-medium',
                active ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
              {parts.weekday}
            </Text>
            <Text
              className={cn(
                'my-0.5 text-2xl leading-8 font-bold',
                active ? 'text-primary-foreground' : 'text-foreground'
              )}>
              {parts.day}
            </Text>
            <Text
              className={cn(
                'text-xs',
                active ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
              {parts.month}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
