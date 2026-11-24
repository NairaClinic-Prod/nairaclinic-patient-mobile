import { PressableScale } from '@/components/patterns/pressable-scale';
import { Sheet } from '@/components/patterns/sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Check, ChevronDown } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type Option<T extends string> = { value: T; label: string };

type InlineSelectProps<T extends string> = {
  label?: string;
  title?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

// A small dropdown that sits on a muted panel and opens its choices in a sheet.
export function InlineSelect<T extends string>({
  label,
  title,
  value,
  options,
  onChange,
}: InlineSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <View className="flex-row items-center gap-2">
      {label ? <Text className="text-muted-foreground text-[13px]">{label}</Text> : null}
      <PressableScale
        scaleTo={0.96}
        role="button"
        accessibilityLabel={`${label ?? title ?? 'Choose'}: ${current?.label ?? ''}`}
        onPress={() => setOpen(true)}
        className="bg-card h-10 flex-row items-center gap-2 rounded-xl px-3">
        <Text className="text-[14px] font-semibold">{current?.label}</Text>
        <Icon as={ChevronDown} className="text-muted-foreground size-4" />
      </PressableScale>
      <Sheet open={open} onClose={() => setOpen(false)} title={title ?? label ?? 'Choose'}>
        <View className="bg-muted overflow-hidden rounded-3xl">
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                role="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  Haptics.selectionAsync();
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'border-border/70 h-12 flex-row items-center justify-between px-4 active:opacity-70',
                  index < options.length - 1 ? 'border-b' : ''
                )}>
                <Text
                  className={cn(
                    'text-[14px]',
                    selected ? 'text-primary font-bold' : 'font-medium'
                  )}>
                  {option.label}
                </Text>
                {selected ? <Icon as={Check} className="text-primary size-4" /> : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}
