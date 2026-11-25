import { TAB_BAR_HEIGHT, TAB_BAR_MIN_BOTTOM } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { usePhoto } from '@/features/profile/hooks/use-photo';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { FileHeart, FlaskConical, House, ShoppingBag, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  home: { label: 'Home', icon: House },
  records: { label: 'Health records', icon: FileHeart },
  orders: { label: 'To-do and orders', icon: ShoppingBag },
  lab: { label: 'Lab tests', icon: FlaskConical },
  profile: { label: 'Profile', icon: User },
};

const SIDE_MARGIN = 32;
const PADDING = 5;
const INDICATOR = TAB_BAR_HEIGHT - PADDING * 2;
const SPRING = { damping: 22, stiffness: 240, mass: 0.7 };
const HAS_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

// The pill is Liquid Glass on iOS 26+. Elsewhere it is a soft translucent card, since Android has no glass.
export function FloatingTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const color = useColor();
  const photo = usePhoto();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = React.useState(0);
  // The tab the patient just touched. It lights up at once, even while a heavy screen is still
  // mounting, and clears when the navigation state catches up.
  const [touched, setTouched] = React.useState<number | null>(null);
  const active = touched ?? state.index;
  // True once a touch has already switched tabs, so the release doesn't switch a second time.
  const switched = React.useRef(false);
  const position = useSharedValue(state.index);
  const slot = (width - PADDING * 2) / state.routes.length;

  React.useEffect(() => {
    position.set(withSpring(active, SPRING));
  }, [active, position]);

  React.useEffect(() => {
    setTouched(null);
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: width ? 1 : 0,
    transform: [{ translateX: PADDING + position.get() * slot + (slot - INDICATOR) / 2 }],
  }));

  const pill = [
    styles.pill,
    HAS_GLASS
      ? null
      : {
          backgroundColor: `${color.secondary}F2`,
          borderColor: color.border,
          borderWidth: StyleSheet.hairlineWidth,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        },
  ];

  const content = (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          { backgroundColor: color.card, shadowColor: '#000' },
          indicatorStyle,
        ]}
      />
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = index === active;
        const go = () => {
          const event = emitter.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (index === state.index || event.defaultPrevented) return false;
          Haptics.selectionAsync();
          setTouched(index);
          navigateToTab(route.key);
          return true;
        };
        // Respond on touch-down, not on release: the tab switches the moment the finger lands.
        const onPressIn = () => {
          switched.current = go();
        };
        // Screen readers and keyboards only send a press, so switch here if touch-down didn't.
        const onPress = () => {
          if (switched.current) switched.current = false;
          else go();
        };
        return (
          <Pressable
            key={route.key}
            role="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            onPressIn={onPressIn}
            onPress={onPress}
            hitSlop={{ top: 8, bottom: 8 }}
            style={styles.slot}>
            {route.name === 'profile' && photo ? (
              <Image
                source={{ uri: photo }}
                accessibilityLabel="Your profile photo"
                style={[styles.avatar, focused && { borderColor: color.primary, borderWidth: 2 }]}
              />
            ) : (
              <tab.icon
                size={20}
                strokeWidth={focused ? 2.4 : 2}
                color={focused ? color.primary : color.mutedForeground}
              />
            )}
          </Pressable>
        );
      })}
    </>
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM) }]}>
      {HAS_GLASS ? (
        <GlassView
          glassEffectStyle="regular"
          tintColor={`${color.secondary}99`}
          style={pill}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
          {content}
        </GlassView>
      ) : (
        <View style={pill} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
          {content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: SIDE_MARGIN, right: SIDE_MARGIN },
  pill: {
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    paddingHorizontal: PADDING,
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    left: 0,
    width: INDICATOR,
    height: INDICATOR,
    borderRadius: INDICATOR / 2,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  slot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 26, height: 26, borderRadius: 13 },
});
