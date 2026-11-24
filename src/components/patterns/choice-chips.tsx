import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';

type ChoiceChipsProps = {
  label: string;
  options: readonly string[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function ChoiceChips({ label, options, value, disabled, onChange }: ChoiceChipsProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-muted-foreground text-xs font-semibold">{label}</Text>
      <View className={cn('flex-row flex-wrap gap-2', disabled && 'opacity-55')}>
        {options.map((option) => {
          const selected = option.toLowerCase() === value.toLowerCase();
          return (
            <Pressable
              key={option}
              role="button"
              disabled={disabled}
              accessibilityState={{ selected, disabled: Boolean(disabled) }}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(selected ? '' : option);
              }}
              className={cn(
                'h-10 items-center justify-center rounded-full border px-4 active:opacity-70',
                selected ? 'border-primary bg-secondary' : 'border-border bg-card'
              )}>
              <Text
                className={cn(
                  'text-[13px] font-semibold',
                  selected ? 'text-primary' : 'text-muted-foreground'
                )}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
