import { CheckBox } from '@/components/shared/check-box';
import { PressableScale } from '@/components/shared/pressable-scale';
import { Stepper } from '@/components/shared/stepper';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';
import type { OrderKind, OrderSource } from '../types';

type PickStepProps = {
  kind: OrderKind;
  sources: OrderSource[];
  source: OrderSource | null;
  picked: Record<string, number>;
  onPickSource: (source: OrderSource) => void;
  onPacks: (name: string, packs: number) => void;
};

const COPY = {
  medication: {
    list: 'Your prescriptions',
    empty: 'No prescriptions to order from yet. Add one from another clinic first.',
    note: 'Pharmacies quote for the exact strength and pack. No payment yet.',
  },
  lab: {
    list: 'Your test orders',
    empty: 'No test orders from your doctor yet. Add one from another clinic first.',
    note: 'No payment yet. You pick a laboratory next.',
  },
} as const;

export const pickNote = (kind: OrderKind) => COPY[kind].note;

export function PickStep({ kind, sources, source, picked, onPickSource, onPacks }: PickStepProps) {
  const copy = COPY[kind];

  if (!source) {
    return (
      <View className="gap-3">
        <Text className="text-base font-extrabold">{copy.list}</Text>
        {sources.length ? (
          sources.map((entry) => (
            <PressableScale
              key={entry.id}
              scaleTo={0.985}
              role="button"
              onPress={() => onPickSource(entry)}
              className="gap-1.5 rounded-2xl border border-border bg-card p-4">
              <View className="flex-row items-start gap-3">
                <Text className="min-w-0 flex-1 text-[15px] leading-5 font-bold">
                  {entry.title}
                </Text>
                {entry.external ? (
                  <View className="rounded-full bg-warning-soft px-2.5 py-1">
                    <Text className="text-[11px] font-bold text-warning">Added by you</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-xs leading-4.5 text-muted-foreground">{entry.meta}</Text>
              <Text className="text-[13px] leading-5 font-medium">
                {entry.items.map((item) => item.name).join(', ')}
              </Text>
            </PressableScale>
          ))
        ) : (
          <View className="rounded-2xl border border-dashed border-border px-4 py-6">
            <Text className="text-center text-[13px] leading-5 text-muted-foreground">
              {copy.empty}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="gap-5">
      <View>
        {source.items.map((item, index) => {
          const packs = picked[item.name] ?? 0;
          const on = packs > 0;
          return (
            <View
              key={item.name}
              className={cn(
                'flex-row items-center gap-3 py-3.5',
                index > 0 && 'border-t border-border'
              )}>
              <PressableScale
                scaleTo={0.98}
                role="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={item.name}
                onPress={() => onPacks(item.name, on ? 0 : 1)}
                className="min-w-0 flex-1 flex-row items-start gap-3">
                <CheckBox checked={on} />
                <View className="min-w-0 flex-1">
                  <Text
                    className={cn(
                      'text-[15px] leading-5 font-semibold',
                      !on && 'text-muted-foreground'
                    )}>
                    {item.name}
                  </Text>
                  {item.detail ? (
                    <Text className="mt-0.5 text-xs leading-4.5 text-muted-foreground">
                      {item.detail}
                    </Text>
                  ) : null}
                </View>
              </PressableScale>
              {kind === 'medication' ? (
                <Stepper
                  label={`packs of ${item.name}`}
                  value={Math.max(1, packs)}
                  disabled={!on}
                  onChange={(next) => onPacks(item.name, next)}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
