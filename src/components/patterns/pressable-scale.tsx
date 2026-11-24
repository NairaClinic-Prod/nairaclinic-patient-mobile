import * as React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 34, stiffness: 420, mass: 0.6, overshootClamping: true, reduceMotion: ReduceMotion.System };

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  className?: string;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

// Feedback lands on touch-down, not release, and the spring can be grabbed and reversed mid-press.
export function PressableScale({
  scaleTo = 0.97,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      style={[style, animated]}
      onPressIn={(event) => {
        if (!disabled) scale.set(withSpring(scaleTo, SPRING));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(event);
      }}
    />
  );
}
