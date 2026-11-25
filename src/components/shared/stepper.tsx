import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Minus, Plus } from 'lucide-react-native';
import { View } from 'react-native';

type StepperProps = {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  label: string;
  onChange: (value: number) => void;
};

export function Stepper({ value, min = 1, max = 20, disabled, label, onChange }: StepperProps) {
  const step = (delta: number) => {
    Haptics.selectionAsync();
    onChange(Math.max(min, Math.min(max, value + delta)));
  };
  return (
    <View
      className={cn('flex-row items-center rounded-full bg-muted', disabled && 'opacity-40')}
      accessibilityLabel={`${label}: ${value}`}>
      <PressableScale
        scaleTo={0.9}
        role="button"
        accessibilityLabel={`Fewer ${label}`}
        disabled={disabled || value <= min}
        onPress={() => step(-1)}
        className="size-9 items-center justify-center">
        <Icon as={Minus} className="size-4 text-foreground" />
      </PressableScale>
      <Text className="min-w-7 text-center text-[14px] font-bold">{value}</Text>
      <PressableScale
        scaleTo={0.9}
        role="button"
        accessibilityLabel={`More ${label}`}
        disabled={disabled || value >= max}
        onPress={() => step(1)}
        className="size-9 items-center justify-center">
        <Icon as={Plus} className="size-4 text-foreground" />
      </PressableScale>
    </View>
  );
}
