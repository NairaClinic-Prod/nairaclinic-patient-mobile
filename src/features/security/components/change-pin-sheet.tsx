import { useChangePin } from '@/api/auth';
import { ActionButton } from '@/components/shared/action-button';
import { Sheet } from '@/components/shared/sheet';
import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { View } from 'react-native';
import { PIN_LENGTH } from '../constants';

const digits = (value: string) => value.replace(/\D/g, '').slice(0, PIN_LENGTH);

type ChangePinSheetProps = { open: boolean; onClose: () => void; onChanged?: () => void };

export function ChangePinSheet({ open, onClose, onChanged }: ChangePinSheetProps) {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const changePin = useChangePin();

  React.useEffect(() => {
    if (open) {
      setCurrent('');
      setNext('');
      setConfirm('');
      setError(null);
    }
  }, [open]);

  async function save() {
    setError(null);
    try {
      await changePin.mutateAsync({ currentPin: current, newPin: next });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onChanged?.();
      onClose();
    } catch (failure) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(failure instanceof Error ? failure.message : "Couldn't change your PIN.");
    }
  }

  const missing = [
    ...(current.length === PIN_LENGTH ? [] : ['Your current PIN']),
    ...(next.length === PIN_LENGTH ? [] : [`A new ${PIN_LENGTH}-digit PIN`]),
    ...(next.length === PIN_LENGTH && current === next
      ? ['A PIN different from your current one']
      : []),
    ...(next.length === PIN_LENGTH && confirm !== next ? ['The same new PIN again'] : []),
  ];

  const field = (label: string, value: string, set: (value: string) => void) => (
    <TextField
      sheet
      tone="muted"
      label={label}
      secureTextEntry
      keyboardType="number-pad"
      maxLength={PIN_LENGTH}
      placeholder="•••••"
      value={value}
      onChangeText={(text) => set(digits(text))}
    />
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Change your PIN"
      subtitle={`Enter your current PIN, then choose a new ${PIN_LENGTH}-digit PIN.`}
      snapPoints={['70%']}
      footer={
        <View className="gap-2">
          {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
          {missing.length ? (
            <Text className="text-xs text-muted-foreground">{`Still needed: ${missing.join(', ')}.`}</Text>
          ) : null}
          <View className="flex-row gap-2">
            <ActionButton
              size="md"
              label="Cancel"
              variant="outline"
              className="flex-1"
              onPress={onClose}
            />
            <ActionButton
              size="md"
              label={changePin.isPending ? 'Saving…' : 'Change PIN'}
              className="flex-[2]"
              disabled={missing.length > 0 || changePin.isPending}
              onPress={save}
            />
          </View>
        </View>
      }>
      <View className="gap-3.5">
        {field('Current PIN', current, setCurrent)}
        {field('New PIN', next, setNext)}
        {field('Confirm new PIN', confirm, setConfirm)}
      </View>
    </Sheet>
  );
}
