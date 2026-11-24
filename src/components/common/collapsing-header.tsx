import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import NativeMaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { AccessibilityInfo, StyleSheet, View, type ViewProps } from 'react-native';
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
const FADE = 40;
const BLUR_RAMP = 40;
const TITLE_RAMP = 64;
const BLUR_INTENSITY = 40;

const MaskedView = NativeMaskedView as unknown as React.ComponentType<
  ViewProps & { maskElement: React.ReactElement }
>;

export type HeaderBarInfo = {
  title: string;
  right?: React.ReactNode;
  content?: React.ReactNode;
  bottom: number;
};

type HeaderBarContextValue = {
  register: (next: Partial<HeaderBarInfo>) => void;
  fixed: boolean;
};

export const HeaderBarContext = React.createContext<HeaderBarContextValue | null>(null);

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

type ProgressiveBlurProps = { tint: 'light' | 'dark'; background: string };

// One blur, masked by a gradient so it is solid under the status bar and melts into the content below. A colour wash fades with it.
function ProgressiveBlur({ tint, background }: ProgressiveBlurProps) {
  return (
    <>
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            colors={['#000', '#000', '#0000']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
        }>
        <BlurView intensity={BLUR_INTENSITY} tint={tint} style={StyleSheet.absoluteFill} />
      </MaskedView>
      <LinearGradient
        colors={[`${background}E6`, `${background}99`, `${background}00`]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

type HeaderBarProps = {
  scrollY: SharedValue<number>;
  info: HeaderBarInfo;
  fixed: boolean;
  gutter: number;
};

// Follows the scroll position one to one. Collapsing: the small title arrives as the large one leaves. Fixed: the whole header stays put.
export function HeaderBar({ scrollY, info, fixed, gutter }: HeaderBarProps) {
  const { top } = useScreenInsets();
  const color = useColor();
  const { theme } = useUniwind();
  const solid = useReduceTransparency();
  const barHeight = fixed ? info.bottom : top + ROW;
  const height = barHeight + FADE;
  const start = useSharedValue(0);

  React.useEffect(() => {
    start.set(Math.max(info.bottom - barHeight - 28, 12));
  }, [info.bottom, barHeight, start]);

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [0, BLUR_RAMP], [0, 1], Extrapolation.CLAMP),
  }));

  const titleStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.get(),
      [start.get(), start.get() + TITLE_RAMP],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity: progress, transform: [{ translateY: (1 - progress) * 10 }] };
  });

  const rightProps = useAnimatedProps(() => ({
    pointerEvents:
      scrollY.get() > start.get() + TITLE_RAMP / 2 ? ('box-none' as const) : ('none' as const),
  }));

  return (
    <View pointerEvents="box-none" style={[styles.bar, { height }]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, blurStyle]}>
        {solid ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: color.background }]} />
        ) : (
          <ProgressiveBlur
            tint={theme === 'dark' ? 'dark' : 'light'}
            background={color.background}
          />
        )}
      </Animated.View>
      {fixed ? (
        <View style={{ paddingTop: top, paddingHorizontal: gutter }}>{info.content}</View>
      ) : (
        <Animated.View
          animatedProps={rightProps}
          style={[styles.row, { height: ROW, marginTop: top }, titleStyle]}>
          <Text className="text-base font-extrabold tracking-tight" numberOfLines={1}>
            {info.title}
          </Text>
          {info.right ? <View style={styles.right}>{info.right}</View> : null}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  row: { alignItems: 'center', justifyContent: 'center' },
  right: {
    position: 'absolute',
    right: SCREEN_PADDING_X,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
