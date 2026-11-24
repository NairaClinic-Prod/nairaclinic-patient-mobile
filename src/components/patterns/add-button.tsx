import { Icon } from '@/components/ui/icon';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const PRESSED = 0.92;
const SPRING = { damping: 22, stiffness: 420, mass: 0.6, reduceMotion: ReduceMotion.System };

type AddButtonProps = { label: string; onPress?: () => void };

// The round plus used in tab headers. It answers on touch-down, not on release, and the spring can be interrupted mid-press.
export function AddButton({ label, onPress }: AddButtonProps) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPressIn={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.set(withSpring(PRESSED, SPRING));
      }}
      onPressOut={() => scale.set(withSpring(1, SPRING))}
      onPress={onPress}>
      <Animated.View
        style={style}
        className="bg-primary size-11 items-center justify-center rounded-full">
        <Icon as={Plus} className="text-primary-foreground size-5" />
      </Animated.View>
    </Pressable>
  );
}
