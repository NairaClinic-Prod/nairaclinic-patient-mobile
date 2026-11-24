import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

export const ProgressContext = React.createContext<SharedValue<number> | null>(null);
export const SlideIndexContext = React.createContext(0);

type RevealProps = {
  distance?: number;
  lift?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

// Each layer reads the one shared slide position, so layers with a bigger distance
// travel faster and the slides cross over with no gap and no timers.
export function Reveal({ distance = 56, lift = 0, style, children }: RevealProps) {
  const progress = React.useContext(ProgressContext);
  const index = React.useContext(SlideIndexContext);
  const reduced = useReducedMotion();
  const travel = reduced ? 0 : distance;
  const rise = reduced ? 0 : lift;

  const animatedStyle = useAnimatedStyle(() => {
    const offset = index - (progress ? progress.get() : index);
    const away = Math.min(1, Math.abs(offset));
    return {
      opacity: Math.max(0, 1 - away * 1.35),
      transform: [
        { translateX: offset * travel },
        { translateY: away * rise },
        { scale: 1 - away * 0.06 },
      ],
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
