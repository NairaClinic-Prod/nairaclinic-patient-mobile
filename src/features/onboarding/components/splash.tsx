import { useColor } from '@/hooks/use-color';
import { FONT } from '@/lib/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const LOGO = require('@assets/images/logo.png');

const PALETTE = {
  light: {
    flood: ['#bfe9da', '#eaf7f0', '#fdeed6'] as const,
    ink: '#1d3235',
    accent: '#0f6f73',
    soft: '#4f6b66',
  },
  dark: {
    flood: ['#134238', '#0c1a16', '#0f2c33'] as const,
    ink: '#e7f0ea',
    accent: '#3db3a8',
    soft: '#94a89d',
  },
};
const LOGO_SIZE = 160;
const WORD = 'NairaClinic'.split('');
const SPLIT = 5;
const TOTAL_MS = 2300;
const EXIT_MS = 700;

// Returns 0 to 1 as t moves through the window [from, to].
function win(t: number, from: number, to: number) {
  'worklet';
  return Math.min(1, Math.max(0, (t - from) / (to - from)));
}

function easeOut(x: number) {
  'worklet';
  return 1 - Math.pow(1 - x, 3);
}

function Letter({
  t,
  index,
  char,
  color,
}: {
  t: SharedValue<number>;
  index: number;
  char: string;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const x = easeOut(win(t.get(), 0.42 + index * 0.014, 0.6 + index * 0.014));
    return { opacity: x, transform: [{ translateY: (1 - x) * 22 }] };
  });
  return (
    <Animated.Text
      style={[{ fontSize: 36, fontFamily: FONT.extrabold, letterSpacing: -0.8, color }, style]}>
      {char}
    </Animated.Text>
  );
}

type SplashProps = {
  exit: SharedValue<number>;
  onDone: () => void;
};

// The brand colour floods out from the logo, then the whole panel drops away from the top edge.
export function Splash({ exit, onDone }: SplashProps) {
  const color = useColor();
  const { theme } = useUniwind();
  const palette = PALETTE[theme === 'dark' ? 'dark' : 'light'];
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const t = useSharedValue(0);
  const started = React.useRef(false);

  const flood = Math.hypot(width, height) + 40;

  function start() {
    if (started.current) return;
    started.current = true;
    SplashScreen.hideAsync();
    t.set(
      withTiming(1, { duration: reduced ? 800 : TOTAL_MS, easing: Easing.linear }, (finished) => {
        if (!finished) return;
        exit.set(
          withTiming(1, { duration: EXIT_MS, easing: Easing.bezier(0.7, 0, 0.2, 1) }, (done) => {
            if (done) scheduleOnRN(onDone);
          })
        );
      })
    );
  }

  const panel = useAnimatedStyle(() => {
    const x = exit.get();
    const round = 44 * win(x, 0, 0.2);
    return {
      borderTopLeftRadius: round,
      borderTopRightRadius: round,
      transform: [{ translateY: x * (height + 60) }],
    };
  });

  const floodStyle = useAnimatedStyle(() => {
    const x = easeOut(win(t.get(), 0.03, 0.36));
    return { transform: [{ scale: LOGO_SIZE / flood + x * (1 - LOGO_SIZE / flood) }] };
  });

  const mark = useAnimatedStyle(() => {
    const time = t.get();
    const beat =
      Math.sin(Math.PI * win(time, 0.16, 0.3)) * 0.1 +
      Math.sin(Math.PI * win(time, 0.3, 0.42)) * 0.05;
    return { transform: [{ scale: 1 + beat }] };
  });

  const tagline = useAnimatedStyle(() => {
    const x = easeOut(win(t.get(), 0.66, 0.84));
    return { opacity: x, transform: [{ translateY: (1 - x) * 10 }] };
  });

  const fade = useAnimatedStyle(() => ({ opacity: 1 - win(exit.get(), 0.15, 0.7) }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: color.background, overflow: 'hidden' },
          panel,
        ]}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: flood,
              height: flood,
              borderRadius: flood / 2,
              left: (width - flood) / 2,
              top: (height - flood) / 2,
              overflow: 'hidden',
            },
            floodStyle,
          ]}>
          <LinearGradient
            colors={palette.flood}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, fade]}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: (width - LOGO_SIZE) / 2,
                top: (height - LOGO_SIZE) / 2,
              },
              mark,
            ]}>
            <Image
              source={LOGO}
              onLoad={start}
              style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              resizeMode="contain"
            />
          </Animated.View>

          <View style={[styles.line, { top: height / 2 + LOGO_SIZE / 2 + 28 }]}>
            {WORD.map((char, index) => (
              <Letter
                key={index}
                t={t}
                index={index}
                char={char}
                color={index < SPLIT ? palette.ink : palette.accent}
              />
            ))}
          </View>
          <Animated.Text
            style={[
              styles.tagline,
              { top: height / 2 + LOGO_SIZE / 2 + 82, color: palette.soft },
              tagline,
            ]}>
            Healthcare in one app
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  line: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  tagline: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: FONT.medium,
    letterSpacing: 0.3,
  },
});
