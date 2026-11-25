import { useScrollToFocused } from '@/features/auth/components/auth-layout';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type TextInputProps } from 'react-native';

type FieldProps = TextInputProps & {
  label: string;
  icon: LucideIcon;
  error?: string;
  right?: React.ReactNode;
};

export function Field({ label, icon, error, right, onFocus, onBlur, ...props }: FieldProps) {
  const [focused, setFocused] = React.useState(false);
  const scrollToFocused = useScrollToFocused();
  return (
    <View className="gap-2">
      <Label nativeID={label}>{label}</Label>
      <View className="justify-center">
        <Input
          aria-labelledby={label}
          aria-invalid={!!error}
          style={{ height: 56, fontSize: 16 }}
          className={`rounded-full bg-card pl-12 ${right ? 'pr-14' : 'pr-5'} ${error ? 'border-destructive' : focused ? 'border-primary' : ''}`}
          onFocus={(event) => {
            setFocused(true);
            scrollToFocused();
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        <View className="absolute left-4" pointerEvents="none">
          <Icon
            as={icon}
            className={`size-5 ${focused ? 'text-primary' : 'text-muted-foreground'}`}
          />
        </View>
        {right ? <View className="absolute right-2">{right}</View> : null}
      </View>
      {error ? <Text className="pl-2 text-[13px] text-destructive">{error}</Text> : null}
    </View>
  );
}
