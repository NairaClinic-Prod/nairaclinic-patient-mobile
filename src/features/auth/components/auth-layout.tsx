import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as React from 'react';
import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('@assets/images/logo.png');

const FOOTER_HEIGHT = 36;
const BAR_HEIGHT = 150;
const BAR_OPEN_HEIGHT = 96;
const DEFAULT_KEYBOARD_HEIGHT = 340;
const EXTRA_HEIGHT = 48;

const ScrollToFocusedContext = React.createContext<() => void>(() => undefined);

export function useScrollToFocused() {
  return React.useContext(ScrollToFocusedContext);
}

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  actions: React.ReactNode;
  extra?: React.ReactNode;
  footerText: string;
  footerAction: string;
  onFooterPress: () => void;
  children: React.ReactNode;
};

// The button bar rides on the keyboard frame by frame, so nothing jumps or lags behind it.
export function AuthLayout({
  title,
  subtitle,
  actions,
  extra,
  footerText,
  footerAction,
  onFooterPress,
  children,
}: AuthLayoutProps) {
  const color = useColor();
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const { height: windowHeight } = useWindowDimensions();
  const scrollY = React.useRef(0);
  const keyboardHeight = React.useRef(0);
  const [keyboardSpace, setKeyboardSpace] = React.useState(0);
  const contentHeight = React.useRef(0);
  const viewportHeight = React.useRef(0);
  const barOpenHeight = BAR_OPEN_HEIGHT + (extra ? EXTRA_HEIGHT : 0);
  const scrollRef = React.useRef<{
    scrollTo: (options: { y: number; animated?: boolean }) => void;
    getInnerViewRef: () => unknown;
    scrollToEnd: (options?: { animated?: boolean }) => void;
  } | null>(null);

  // Scrolls only as far as needed to keep the focused field clear of the keyboard and the bar.
  const scrollToFocused = React.useCallback(() => {
    setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      const scroll = scrollRef.current;
      const inner = scroll?.getInnerViewRef();
      if (!input || !scroll || !inner) return;
      input.measureLayout(
        inner as never,
        (_x, y, _w, h) => {
          const visible =
            windowHeight - (keyboardHeight.current || DEFAULT_KEYBOARD_HEIGHT) - barOpenHeight - 16;
          const bottom = y + Math.max(h, 64);
          let target = scrollY.current;
          if (bottom > scrollY.current + visible) target = bottom - visible;
          else if (y - 64 < scrollY.current + insets.top) target = y - 64 - insets.top;
          scroll.scrollTo({ y: Math.max(0, target), animated: true });
        },
        () => undefined
      );
    }, 100);
  }, [insets.top, windowHeight, barOpenHeight]);

  // The room below the form appears the moment the keyboard starts to show, so the very first
  // scroll already has somewhere to go. It is cleared once the keyboard is fully hidden.
  React.useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const willHide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(show, (event) => {
      keyboardHeight.current = event.endCoordinates.height;
      setKeyboardSpace(event.endCoordinates.height);
      scrollToFocused();
    });
    const willHideSub = Keyboard.addListener(willHide, () => {
      // Scroll back in step with the keyboard, so nothing jumps when the room below is removed.
      const naturalMax = Math.max(
        0,
        contentHeight.current - keyboardHeight.current - viewportHeight.current
      );
      scrollRef.current?.scrollTo({ y: Math.min(scrollY.current, naturalMax), animated: true });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      keyboardHeight.current = 0;
      setKeyboardSpace(0);
    });
    return () => {
      showSub.remove();
      willHideSub.remove();
      hideSub.remove();
    };
  }, [scrollToFocused]);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  // The bar keeps one fixed size. On iOS its bottom edge follows the keyboard and the footer
  // line slides under it. This moves the real layout position (not a transform) because the
  // native glass button does not follow a transformed parent.
  const barStyle = useAnimatedStyle(() => {
    if (Platform.OS !== 'ios') return {};
    const kh = keyboard.height.get();
    const lift = Math.min(1, kh / 120);
    return { bottom: kh - lift * (FOOTER_HEIGHT + 12 + insets.bottom) };
  });

  // Only the opacity changes, so the footer fades without moving anything else.
  const footerStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, keyboard.height.get() / 120),
  }));

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[color.gradientStart, color.background]}
        locations={[0, 0.55]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        className="absolute -top-16 -right-20 size-64 rounded-full bg-[#92dcca]/50 dark:bg-[#3db3a8]/20"
      />
      <View
        pointerEvents="none"
        className="absolute top-24 right-28 size-20 rounded-full bg-[#f3b46d]/35 dark:bg-[#f3b46d]/10"
      />

      <ScrollView
        ref={scrollRef as never}
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: SCREEN_PADDING_X,
        }}
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => {
          scrollY.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        onLayout={(event) => {
          viewportHeight.current = event.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_width, height) => {
          contentHeight.current = height;
        }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <Button size="icon" onPress={goBack} accessibilityLabel="Go back">
            <Icon as={ChevronLeft} className="size-5 text-foreground" />
          </Button>
          <View className="size-12 items-center justify-center rounded-2xl bg-card shadow-sm shadow-black/10">
            <Image source={LOGO} style={{ width: 32, height: 32 }} resizeMode="contain" />
          </View>
        </View>

        <View className="mt-8 gap-2">
          <Text className="text-[32px] leading-[38px] font-extrabold tracking-tight">{title}</Text>
          <Text className="text-base leading-6 text-muted-foreground">{subtitle}</Text>
        </View>

        <ScrollToFocusedContext.Provider value={scrollToFocused}>
          <View className="mt-8 gap-5">{children}</View>
        </ScrollToFocusedContext.Provider>

        <View
          style={{
            height: BAR_HEIGHT + (extra ? EXTRA_HEIGHT : 0) + insets.bottom + keyboardSpace,
          }}
        />
      </ScrollView>

      <Animated.View
        className="absolute inset-x-0 bottom-0 gap-3 border-t border-border bg-background pt-4"
        style={[
          { paddingHorizontal: SCREEN_PADDING_X, paddingBottom: 8 + insets.bottom },
          barStyle,
        ]}>
        {extra}
        {actions}
        <Animated.View style={[{ height: FOOTER_HEIGHT }, footerStyle]}>
          <View className="flex-row items-center justify-center">
            <Text className="text-[15px] text-muted-foreground">{footerText}</Text>
            <Button variant="link" size="sm" className="px-1.5" onPress={onFooterPress}>
              <Text className="text-[15px] font-bold">{footerAction}</Text>
            </Button>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
