import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CalendarCheck, CalendarPlus, ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

type CalendarRowProps = { connected: boolean; onPress: () => void };

// Always on the Reminders screen, so connecting never depends on the popup having been shown.
export function CalendarRow({ connected, onPress }: CalendarRowProps) {
  return (
    <PressableScale
      scaleTo={0.98}
      role="button"
      accessibilityLabel={connected ? 'Calendar connected' : 'Add your reminders to your calendar'}
      onPress={onPress}
      className="bg-card flex-row items-center gap-3 rounded-2xl p-3.5">
      <View className="bg-secondary size-10 items-center justify-center rounded-full">
        <Icon
          as={connected ? CalendarCheck : CalendarPlus}
          className={connected ? 'text-success size-[18px]' : 'text-primary size-[18px]'}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[13px] font-bold">
          {connected ? 'Calendar connected' : 'Add reminders to your calendar'}
        </Text>
        <Text className="text-muted-foreground text-[11px] leading-4">
          {connected ? 'Tap to review calendar access' : 'Connect once and never miss one'}
        </Text>
      </View>
      <Icon as={ChevronRight} className="text-muted-foreground size-4" />
    </PressableScale>
  );
}
