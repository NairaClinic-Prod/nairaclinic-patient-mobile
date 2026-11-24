import { ActionButton } from '@/components/patterns/action-button';
import { Icon } from '@/components/ui/icon';
import * as Haptics from 'expo-haptics';
import { Check, RotateCcw } from 'lucide-react-native';
import { Pressable } from 'react-native';

type DoneButtonProps = { finished: boolean; onPress: () => void };

export function DoneButton({ finished, onPress }: DoneButtonProps) {
  if (finished) {
    return (
      <ActionButton
        label="Undo"
        icon={RotateCcw}
        variant="ghost"
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
      />
    );
  }
  return (
    <Pressable
      role="button"
      accessibilityLabel="Mark as done"
      onPress={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPress();
      }}
      className="bg-secondary size-9 items-center justify-center rounded-full active:opacity-70">
      <Icon as={Check} className="text-success size-4" />
    </Pressable>
  );
}
