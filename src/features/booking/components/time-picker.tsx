import { PressableScale } from '@/components/shared/pressable-scale';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { View } from 'react-native';
import type { Slot } from '../types';
import { timeRange } from '../utils';
import { PairRows } from './pair-rows';

type TimePickerProps = {
  slots: Slot[];
  durationMins?: number;
  caption?: string;
  selected: string | null;
  nextId?: string;
  onChange: (id: string) => void;
};

export function TimePicker({
  slots,
  durationMins,
  caption,
  selected,
  nextId,
  onChange,
}: TimePickerProps) {
  const text =
    caption ??
    (durationMins ? `Showing times for ${durationMins}-minute consultations` : undefined);
  return (
    <View className="gap-3">
      {text ? <Text className="text-xs text-muted-foreground">{text}</Text> : null}
      <PairRows gap={10}>
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
                'h-14 items-center justify-center rounded-xl border',
                active
                  ? 'border-primary bg-primary'
                  : next
                    ? 'border-primary bg-card'
                    : 'border-border bg-card'
              )}>
              {next ? (
                <View className="absolute top-1 rounded-full bg-primary px-2 py-px">
                  <Text className="text-[9px] font-bold tracking-widest text-primary-foreground uppercase">
                    Next
                  </Text>
                </View>
              ) : null}
              <Text
                className={cn(
                  'mt-1.5 text-[13px] font-medium',
                  active ? 'text-primary-foreground' : 'text-foreground'
                )}>
                {timeRange(slot)}
              </Text>
            </PressableScale>
          );
        })}
      </PairRows>
    </View>
  );
}
