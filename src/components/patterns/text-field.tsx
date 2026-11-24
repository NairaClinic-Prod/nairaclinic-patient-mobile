import { Text } from '@/components/ui/text';
import { BottomSheetTextInput } from '@/components/ui/bottom-sheet';
import { useColor } from '@/hooks/use-color';
import { FONT } from '@/lib/fonts';
import { View, TextInput, type TextInputProps } from 'react-native';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  sheet?: boolean;
  tone?: 'card' | 'muted';
  multiline?: boolean;
};

export function TextField({
  label,
  required,
  disabled,
  hint,
  sheet = false,
  tone = 'card',
  multiline,
  ...props
}: TextFieldProps) {
  const color = useColor();
  const Input = (sheet ? BottomSheetTextInput : TextInput) as typeof TextInput;

  return (
    <View className="gap-1.5">
      <Text className="text-muted-foreground text-xs font-semibold">
        {label}
        {required ? <Text className="text-destructive text-xs font-semibold">{' *'}</Text> : null}
      </Text>
      <Input
        {...props}
        multiline={multiline}
        editable={!disabled}
        accessibilityLabel={label}
        placeholderTextColor={color.mutedForeground}
        style={{
          minHeight: multiline ? 84 : 48,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: multiline ? 12 : 0,
          fontSize: 14,
          fontFamily: FONT.medium,
          color: color.foreground,
          backgroundColor: tone === 'card' ? color.card : color.muted,
          opacity: disabled ? 0.55 : 1,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {hint ? <Text className="text-muted-foreground text-[11px]">{hint}</Text> : null}
    </View>
  );
}
