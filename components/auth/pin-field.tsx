import { Field } from '@/components/auth/field';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
import * as React from 'react';

type PinFieldProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
};

export function PinField({
  label = 'PIN',
  placeholder = 'Enter your 5-digit PIN',
  value,
  onChangeText,
  error,
}: PinFieldProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <Field
      label={label}
      icon={LockKeyhole}
      error={error}
      value={value}
      onChangeText={(text) => onChangeText(text.replace(/\D/g, ''))}
      placeholder={placeholder}
      secureTextEntry={!visible}
      keyboardType="number-pad"
      maxLength={5}
      autoComplete="off"
      right={
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          onPress={() => setVisible((current) => !current)}
          accessibilityLabel={visible ? 'Hide PIN' : 'Show PIN'}>
          <Icon as={visible ? Eye : EyeOff} className="text-muted-foreground size-5" />
        </Button>
      }
    />
  );
}
