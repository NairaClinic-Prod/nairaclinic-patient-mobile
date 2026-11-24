import { PressableScale } from '@/components/shared/pressable-scale';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { ScrollView } from 'react-native';

type Option<T extends string> = { value: T; label: string; count?: number };

type ChipTabsProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  gutter?: number;
};

// Runs edge to edge inside a padded parent so long labels can scroll. Pass the parent's padding as gutter.
export function ChipTabs<T extends string>({
  options,
  value,
  onChange,
  gutter = SCREEN_PADDING_X,
}: ChipTabsProps<T>) {
  return (
    <ScrollView
      horizontal
      role="tablist"
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -gutter, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: gutter, gap: 8 }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            role="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync();
              onChange(option.value);
            }}
            className={cn(
              'h-10 flex-row items-center gap-1.5 rounded-full border px-4',
              selected ? 'border-primary bg-secondary' : 'border-border bg-card'
            )}>
            <Text
              className={cn(
                'text-[13px] font-semibold',
                selected ? 'text-primary' : 'text-muted-foreground'
              )}>
              {option.label}
            </Text>
            {option.count !== undefined ? (
              <Text
                className={cn(
                  'text-[13px] font-semibold',
                  selected ? 'text-primary' : 'text-muted-foreground'
                )}>
                {option.count}
              </Text>
            ) : null}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
