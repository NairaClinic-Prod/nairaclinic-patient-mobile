import { PressableScale } from '@/components/shared/pressable-scale';
import { ActionButton } from '@/components/shared/action-button';
import { Icon } from '@/components/ui/icon';
import * as Haptics from 'expo-haptics';
import { Check, RotateCcw } from 'lucide-react-native';

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
    <PressableScale
      scaleTo={0.92}
      role="button"
      accessibilityLabel="Mark as done"
      hitSlop={4}
      onPress={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPress();
      }}
      className="bg-secondary size-9 items-center justify-center rounded-full">
      <Icon as={Check} className="text-success size-4" />
    </PressableScale>
  );
}
