import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { useColor } from '@/hooks/use-color';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import type * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

type ChoosableProps = {
  selected: boolean;
  disabled?: boolean;
  loading?: boolean;
  label: string;
  className?: string;
  onPress: () => void;
  children: React.ReactNode;
};

export function Choosable({
  selected,
  disabled,
  loading,
  label,
  className,
  onPress,
  children,
}: ChoosableProps) {
  const color = useColor();
  return (
    <PressableScale
      scaleTo={0.985}
      role="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'gap-0 rounded-2xl border p-4',
        selected ? 'border-primary bg-secondary/40' : 'border-border bg-card',
        disabled && 'opacity-60',
        className
      )}>
      {selected ? (
        <View className="absolute top-3 right-3 size-5 items-center justify-center rounded-full bg-primary">
          {loading ? (
            <ActivityIndicator size={12} color={color.primaryForeground} />
          ) : (
            <Icon as={Check} strokeWidth={3} className="size-3.5 text-primary-foreground" />
          )}
        </View>
      ) : null}
      {children}
    </PressableScale>
  );
}
