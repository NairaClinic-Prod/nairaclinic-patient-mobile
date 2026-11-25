import { PressableScale } from '@/components/shared/pressable-scale';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { View } from 'react-native';
import type { Slot } from '../types';
import { timeRange } from '../utils';

type TimePickerProps = {
  slots: Slot[];
  durationMins: number;
  selected: string | null;
  nextId?: string;
  onChange: (id: string) => void;
};

export function TimePicker({ slots, durationMins, selected, nextId, onChange }: TimePickerProps) {
  return (
    <View className="gap-3">
      <Text className="text-xs text-muted-foreground">
        {`Showing times for ${durationMins}-minute consultations`}
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {slots.map((slot) => {
          const active = selected === slot.id;
          const next = slot.id === nextId;
          return (
            <PressableScale
              key={slot.id}
              scaleTo={0.97}
              role="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(slot.id);
              }}
              className={cn(
                'w-[48%] grow items-center rounded-xl border px-2 pb-3',
                next ? 'pt-6' : 'pt-3',
                active
                  ? 'border-primary bg-primary'
                  : next
                    ? 'border-primary bg-card'
                    : 'border-border bg-card'
              )}>
              {next ? (
                <View className="absolute top-1.5 rounded-full bg-primary px-2 py-0.5">
                  <Text className="text-[9px] font-bold tracking-widest text-primary-foreground uppercase">
                    Next
                  </Text>
                </View>
              ) : null}
              <Text
                className={cn(
                  'text-[13px] font-medium',
                  active ? 'text-primary-foreground' : 'text-foreground'
                )}>
                {timeRange(slot)}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
