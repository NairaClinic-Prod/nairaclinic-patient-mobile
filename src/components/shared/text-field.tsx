import { useSheetScroll } from '@/components/shared/sheet-context';
import { Text } from '@/components/ui/text';
import { BottomSheetTextInput } from '@/components/ui/bottom-sheet';
import { useColor } from '@/hooks/use-color';
import { FONT } from '@/lib/fonts';
import * as React from 'react';
import { View, TextInput, type HostInstance, type TextInputProps } from 'react-native';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  sheet?: boolean;
  revealTop?: boolean;
  tone?: 'card' | 'muted';
  multiline?: boolean;
};

export function TextField({
  label,
  required,
  disabled,
  hint,
  sheet = false,
  revealTop = false,
  tone = 'card',
  multiline,
  ...props
}: TextFieldProps) {
  const color = useColor();
  const frame = React.useRef<HostInstance>(null);
  const sheetScroll = useSheetScroll();
  const Input = (sheet ? BottomSheetTextInput : TextInput) as typeof TextInput;

  return (
    <View ref={frame} className="gap-1.5">
      <Text className="text-xs font-semibold text-muted-foreground">
        {label}
        {required ? <Text className="text-xs font-semibold text-destructive">{' *'}</Text> : null}
      </Text>
      <Input
        {...props}
        onFocus={(event) => {
          props.onFocus?.(event);
          if (sheet) sheetScroll?.reveal(frame, revealTop);
        }}
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
      {hint ? <Text className="text-[11px] text-muted-foreground">{hint}</Text> : null}
    </View>
  );
}
