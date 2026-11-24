import { PressableScale } from '@/components/shared/pressable-scale';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { ScrollView, View } from 'react-native';

type ChoiceChipsProps = {
  label: string;
  options: readonly string[];
  value: string;
  disabled?: boolean;
  scroll?: boolean;
  gutter?: number;
  onChange: (value: string) => void;
};

// With scroll the chips stay on one line and slide sideways. Pass the parent's side padding as gutter.
export function ChoiceChips({
  label,
  options,
  value,
  disabled,
  scroll = false,
  gutter = SCREEN_PADDING_X,
  onChange,
}: ChoiceChipsProps) {
  const chips = options.map((option) => {
    const selected = option.toLowerCase() === value.toLowerCase();
    return (
      <PressableScale
        key={option}
        role="button"
        disabled={disabled}
        accessibilityState={{ selected, disabled: Boolean(disabled) }}
        onPress={() => {
          Haptics.selectionAsync();
          onChange(selected ? '' : option);
        }}
        className={cn(
          'h-10 items-center justify-center rounded-full border px-4',
          selected ? 'border-primary bg-secondary' : 'border-border bg-card'
        )}>
        <Text
          className={cn(
            'text-[13px] font-semibold',
            selected ? 'text-primary' : 'text-muted-foreground'
          )}>
          {option}
        </Text>
      </PressableScale>
    );
  });

  return (
    <View className="gap-1.5">
      <Text className="text-muted-foreground text-xs font-semibold">{label}</Text>
      {scroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ marginHorizontal: -gutter, flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: gutter, gap: 8 }}
          className={cn(disabled && 'opacity-55')}>
          {chips}
        </ScrollView>
      ) : (
        <View className={cn('flex-row flex-wrap gap-2', disabled && 'opacity-55')}>{chips}</View>
      )}
    </View>
  );
}
