import type * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

const STAGGER_MS = 45;
const MAX_DELAY_MS = 360;

type FadeInProps = {
  index?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

// Sections rise into place once, a beat after each other, with a critically damped spring so nothing overshoots.
export function FadeIn({ index = 0, className, style, children }: FadeInProps) {
  return (
    <Animated.View
      className={className}
      style={style}
      entering={FadeInDown.springify()
        .damping(36)
        .stiffness(220)
        .delay(Math.min(index * STAGGER_MS, MAX_DELAY_MS))
        .withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] })
        .reduceMotion(ReduceMotion.System)}>
      {children}
    </Animated.View>
  );
}
