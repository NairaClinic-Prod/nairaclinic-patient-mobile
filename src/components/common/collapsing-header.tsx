import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { BlurView } from 'expo-blur';
import * as React from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

const ROW = 44;
const BLUR_RAMP = 24;
const TITLE_RAMP = 24;

export type HeaderBarInfo = { title: string; right?: React.ReactNode; bottom: number };

type Register = (next: Partial<HeaderBarInfo>) => void;

export const HeaderBarContext = React.createContext<Register | null>(null);

export const useHeaderBar = () => React.useContext(HeaderBarContext);

function useReduceTransparency() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled?.().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduced
    );
    return () => subscription.remove();
  }, []);

  return reduced;
}

type CollapsingBarProps = { scrollY: SharedValue<number>; info: HeaderBarInfo };

// Follows the scroll position one to one: the blur arrives first, then the small title as the large one leaves.
export function CollapsingBar({ scrollY, info }: CollapsingBarProps) {
  const { top } = useScreenInsets();
  const color = useColor();
  const { theme } = useUniwind();
  const solid = useReduceTransparency();
  const height = top + ROW;
  const start = useSharedValue(0);

  React.useEffect(() => {
    start.set(Math.max(info.bottom - height - 12, 12));
  }, [info.bottom, height, start]);

  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [0, BLUR_RAMP], [0, 1], Extrapolation.CLAMP),
  }));

  const titleStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.get(),
      [start.get(), start.get() + TITLE_RAMP],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity: progress, transform: [{ translateY: (1 - progress) * 6 }] };
  });

  const rightProps = useAnimatedProps(() => ({
    pointerEvents:
      scrollY.get() > start.get() + TITLE_RAMP / 2 ? ('box-none' as const) : ('none' as const),
  }));

  return (
    <View pointerEvents="box-none" style={[styles.bar, { height }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          barStyle,
          { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: color.border },
        ]}>
        {solid ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: color.background }]} />
        ) : (
          <>
            <BlurView
              intensity={60}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: `${color.background}66` }]} />
          </>
        )}
      </Animated.View>
      <Animated.View animatedProps={rightProps} style={[styles.row, { height: ROW }, titleStyle]}>
        <Text className="text-base font-extrabold" numberOfLines={1}>
          {info.title}
        </Text>
        {info.right ? <View style={styles.right}>{info.right}</View> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, justifyContent: 'flex-end' },
  row: { alignItems: 'center', justifyContent: 'center' },
  right: {
    position: 'absolute',
    right: SCREEN_PADDING_X,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
