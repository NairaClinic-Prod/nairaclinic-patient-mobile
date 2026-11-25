import { useScrollToFocused } from '@/features/auth/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

export const PIN_LENGTH = 5;

type PinFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string;
};

export function PinField({ label = 'PIN', value, onChangeText, onBlur, error }: PinFieldProps) {
  const [focused, setFocused] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const scrollToFocused = useScrollToFocused();
  const inputRef = React.useRef<{ focus: () => void } | null>(null);
  const active = Math.min(value.length, PIN_LENGTH - 1);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Label nativeID={label}>{label}</Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-full px-3"
          onPress={() => setVisible((current) => !current)}
          accessibilityLabel={visible ? 'Hide PIN' : 'Show PIN'}>
          <Icon as={visible ? EyeOff : Eye} className="size-4 text-muted-foreground" />
          <Text className="text-[13px] font-medium text-muted-foreground">
            {visible ? 'Hide' : 'Show'}
          </Text>
        </Button>
      </View>

      <Pressable onPress={() => inputRef.current?.focus()} accessibilityLabel={`${label} input`}>
        <View className="flex-row gap-3">
          {Array.from({ length: PIN_LENGTH }, (_, index) => {
            const digit = value[index];
            const isActive = focused && index === active;
            return (
              <View
                key={index}
                className={`h-14 flex-1 items-center justify-center rounded-2xl border bg-card ${error ? 'border-destructive' : isActive ? 'border-2 border-primary' : 'border-input'}`}>
                {digit ? <Text className="text-xl font-bold">{visible ? digit : '•'}</Text> : null}
              </View>
            );
          })}
        </View>
        <Input
          ref={inputRef as never}
          aria-labelledby={label}
          aria-invalid={!!error}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, PIN_LENGTH))}
          onFocus={() => {
            setFocused(true);
            scrollToFocused();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          keyboardType="number-pad"
          maxLength={PIN_LENGTH}
          caretHidden
          autoComplete="off"
          className="absolute h-px w-px opacity-0"
        />
      </Pressable>
      {error ? <Text className="pl-1 text-[13px] text-destructive">{error}</Text> : null}
    </View>
  );
}
