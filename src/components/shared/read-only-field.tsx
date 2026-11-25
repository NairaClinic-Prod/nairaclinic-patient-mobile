import { PressableScale } from '@/components/shared/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';
import { Lock } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SHOW_MS = 1000;
const FADE_IN_MS = 120;
const FADE_OUT_MS = 350;

type ReadOnlyFieldProps = {
  label: string;
  value: string;
  hint: string;
};

// A value the user can see but not change. Tapping it explains why, in a tooltip that fades after a moment.
export function ReadOnlyField({ label, value, hint }: ReadOnlyFieldProps) {
  const [mounted, setMounted] = React.useState(false);
  const visible = useSharedValue(0);
  const hide = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmount = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const style = useAnimatedStyle(() => ({
    opacity: visible.get(),
    transform: [{ translateY: (1 - visible.get()) * 4 }],
  }));

  React.useEffect(
    () => () => {
      if (hide.current) clearTimeout(hide.current);
      if (unmount.current) clearTimeout(unmount.current);
    },
    []
  );

  function show() {
    Haptics.selectionAsync();
    if (hide.current) clearTimeout(hide.current);
    if (unmount.current) clearTimeout(unmount.current);
    setMounted(true);
    visible.set(withTiming(1, { duration: FADE_IN_MS, reduceMotion: ReduceMotion.System }));
    hide.current = setTimeout(() => {
      visible.set(withTiming(0, { duration: FADE_OUT_MS, reduceMotion: ReduceMotion.System }));
      unmount.current = setTimeout(() => setMounted(false), FADE_OUT_MS);
    }, SHOW_MS);
  }

  return (
    <View className="flex-1" style={{ zIndex: mounted ? 2 : 0 }}>
      {mounted ? (
        <Animated.View
          pointerEvents="none"
          style={style}
          className="absolute right-0 bottom-full left-0 mb-1.5 rounded-xl bg-foreground px-3 py-2">
          <Text className="text-[11px] leading-4 font-medium text-background">{hint}</Text>
        </Animated.View>
      ) : null}
      <PressableScale
        scaleTo={0.98}
        role="button"
        accessibilityLabel={`${label}: ${value}. ${hint}`}
        accessibilityState={{ disabled: true }}
        onPress={show}
        className="gap-1 rounded-3xl bg-muted p-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-[11px] text-muted-foreground">{label}</Text>
          <Icon as={Lock} className="size-2.5 text-muted-foreground" />
        </View>
        <Text className="text-[13px] font-bold">{value}</Text>
      </PressableScale>
    </View>
  );
}
