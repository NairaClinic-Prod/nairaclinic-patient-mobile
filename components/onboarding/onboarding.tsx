import {
  ProgressContext,
  Reveal,
  SlideIndexContext,
} from '@/components/onboarding/reveal';
import { CANVAS, SLIDES } from '@/components/onboarding/slides';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/use-color';
import { FONT } from '@/lib/fonts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeOutUp,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

const LOGO = require('@/assets/images/logo.png');
const LAST = SLIDES.length - 1;

function Stage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = React.useState(1);

  return (
    <View
      className="flex-1 items-center justify-center"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setScale(Math.min(1, width / CANVAS, height / CANVAS));
      }}>
      <View style={{ width: CANVAS, height: CANVAS, transform: [{ scale }] }}>{children}</View>
    </View>
  );
}

function Dot({ index, progress }: { index: number; progress: SharedValue<number> }) {
  const color = useColor();
  const style = useAnimatedStyle(() => {
    const near = Math.max(0, 1 - Math.abs(index - progress.get()));
    return {
      width: 6 + 16 * near,
      backgroundColor: interpolateColor(near, [0, 1], [`${color.primary}40`, color.primary]),
    };
  });
  return <Animated.View style={[{ height: 6, borderRadius: 3 }, style]} />;
}

const SPRING = { stiffness: 200, damping: 28, mass: 1, overshootClamping: true };

// Past the first or last slide the content follows the finger at a quarter of the distance.
function resist(value: number) {
  'worklet';
  if (value < 0) return value * 0.25;
  if (value > LAST) return LAST + (value - LAST) * 0.25;
  return value;
}

type SlideLayerProps = {
  slide: (typeof SLIDES)[number];
  index: number;
  active: boolean;
};

const SlideLayer = React.memo(function SlideLayer({ slide, index, active }: SlideLayerProps) {
  return (
    <SlideIndexContext.Provider value={index}>
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        accessibilityElementsHidden={!active}
        importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}>
        <Stage>
          <slide.Illustration />
        </Stage>
        <View className="items-center px-8" style={{ height: 156 }}>
          <Reveal distance={36}>
            <Text className="text-center text-[28px] font-extrabold leading-[34px] tracking-tight">
              {slide.title}
            </Text>
          </Reveal>
          <Reveal distance={56} style={{ marginTop: 12 }}>
            <Text className="text-muted-foreground text-center text-[15px] leading-[22px]">
              {slide.body}
            </Text>
          </Reveal>
        </View>
      </View>
    </SlideIndexContext.Provider>
  );
});

function CtaButton({ label, onPress }: { label: string; onPress: () => void }) {
  const color = useColor();
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Animated.View
        style={{
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: color.primary,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          transitionProperty: 'transform',
          transitionDuration: 140,
          transitionTimingFunction: 'ease-out',
        }}>
        <Animated.Text
          key={label}
          entering={FadeInDown.duration(240).delay(60)}
          exiting={FadeOutUp.duration(140)}
          style={{
            position: 'absolute',
            color: color.primaryForeground,
            fontSize: 16,
            fontFamily: FONT.bold,
          }}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

type OnboardingProps = {
  onFinish?: () => void;
  onSignIn?: () => void;
};

export function Onboarding({ onFinish, onSignIn }: OnboardingProps) {
  const color = useColor();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [current, setCurrent] = React.useState(0);
  const target = React.useRef(0);
  const progress = useSharedValue(0);

  useAnimatedReaction(
    () => Math.round(progress.get()),
    (now, before) => {
      if (before === null || now === before) return;
      scheduleOnRN(setCurrent, now);
      scheduleOnRN(Haptics.selectionAsync);
    }
  );

  function goTo(next: number) {
    const clamped = Math.min(LAST, Math.max(0, next));
    if (clamped === target.current) return;
    target.current = clamped;
    progress.set(withSpring(clamped, SPRING));
  }

  function settleAt(next: number) {
    target.current = next;
  }

  const start = useSharedValue(0);
  const pan = usePanGesture({
    activeOffsetX: [-10, 10],
    failOffsetY: [-24, 24],
    onActivate: () => {
      'worklet';
      start.set(progress.get());
      progress.set(progress.get());
    },
    onUpdate: (event) => {
      'worklet';
      progress.set(resist(start.get() - event.translationX / width));
    },
    onDeactivate: (event) => {
      'worklet';
      const from = Math.round(start.get());
      const projected = progress.get() - (event.velocityX / width) * 0.18;
      const next = Math.min(LAST, Math.max(0, from - 1, Math.min(from + 1, Math.round(projected))));
      progress.set(withSpring(next, { ...SPRING, velocity: -event.velocityX / width }));
      scheduleOnRN(settleAt, next);
    },
  });

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[color.gradientStart, color.gradientMid, color.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        className="flex-row items-center justify-between px-6"
        style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center gap-2">
          <Image source={LOGO} style={{ width: 32, height: 32 }} resizeMode="contain" />
          <Text className="text-xl font-bold tracking-tight">NairaClinic</Text>
        </View>
        <Pressable
          onPress={() => goTo(LAST)}
          disabled={current === LAST}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Skip">
          <Animated.View
            style={{
              opacity: current === LAST ? 0 : 1,
              transitionProperty: 'opacity',
              transitionDuration: 200,
            }}>
            <Text className="text-muted-foreground text-base font-medium">Skip</Text>
          </Animated.View>
        </Pressable>
      </View>

      <ProgressContext.Provider value={progress}>
        <GestureDetector gesture={pan}>
          <View className="flex-1">
            {SLIDES.map((slide, index) => (
              <SlideLayer key={slide.title} slide={slide} index={index} active={index === current} />
            ))}
          </View>
        </GestureDetector>
      </ProgressContext.Provider>

      <View className="gap-5 px-6" style={{ paddingBottom: insets.bottom + 8 }}>
        <View className="flex-row items-center justify-center gap-1.5">
          {SLIDES.map((slide, index) => (
            <Dot key={slide.title} index={index} progress={progress} />
          ))}
        </View>
        <CtaButton
          label={SLIDES[current].cta}
          onPress={() => (current === LAST ? onFinish?.() : goTo(target.current + 1))}
        />
        <Pressable onPress={onSignIn} accessibilityRole="button" className="items-center pb-1">
          <Text className="text-[15px]">
            Already have an account? <Text className="text-primary text-[15px] font-bold">Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
