import type * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn as FadeInAnimation, ReduceMotion } from 'react-native-reanimated';

const STAGGER_MS = 30;
const MAX_DELAY_MS = 120;

type FadeInProps = {
  index?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

// Sections fade in once, a beat after each other. Opacity only: it needs no layout work, and Reanimated
// runs it on the UI thread, so it stays smooth even while the screen is still filling with data.
export function FadeIn({ index = 0, className, style, children }: FadeInProps) {
  return (
    <Animated.View
      className={className}
      style={style}
      entering={FadeInAnimation.duration(180)
        .delay(Math.min(index * STAGGER_MS, MAX_DELAY_MS))
        .reduceMotion(ReduceMotion.System)}>
      {children}
    </Animated.View>
  );
}
