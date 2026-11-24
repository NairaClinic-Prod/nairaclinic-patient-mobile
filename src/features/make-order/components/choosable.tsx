import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import type * as React from 'react';
import { View } from 'react-native';

type ChoosableProps = {
  selected: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  children: React.ReactNode;
};

export function Choosable({ selected, disabled, label, onPress, children }: ChoosableProps) {
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
        disabled && 'opacity-60'
      )}>
      {selected ? (
        <View className="bg-primary absolute top-3 right-3 size-5 items-center justify-center rounded-full">
          <Icon as={Check} strokeWidth={3} className="text-primary-foreground size-3.5" />
        </View>
      ) : null}
      {children}
    </PressableScale>
  );
}
