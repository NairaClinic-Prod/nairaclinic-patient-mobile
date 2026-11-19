import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SCREEN_PADDING_X } from '@/constants/app.constant';
import { useColor } from '@/hooks/use-color';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as React from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('@/assets/images/logo.png');

const ScrollToFocusedContext = React.createContext<() => void>(() => undefined);

export function useScrollToFocused() {
  return React.useContext(ScrollToFocusedContext);
}

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  actions: React.ReactNode;
  footerText: string;
  footerAction: string;
  onFooterPress: () => void;
  children: React.ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  actions,
  footerText,
  footerAction,
  onFooterPress,
  children,
}: AuthLayoutProps) {
  const color = useColor();
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const scrollRef = React.useRef<{
    scrollTo: (options: { y: number; animated?: boolean }) => void;
    getInnerViewRef: () => unknown;
    scrollToEnd: (options?: { animated?: boolean }) => void;
  } | null>(null);

  // Brings the focused field into the space above the keyboard and the button bar.
  const scrollToFocused = React.useCallback(() => {
    setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      const scroll = scrollRef.current;
      const inner = scroll?.getInnerViewRef();
      if (!input || !scroll || !inner) return;
      input.measureLayout(
        inner as never,
        (_x, y) => scroll.scrollTo({ y: Math.max(0, y - 160), animated: true }),
        () => scroll.scrollToEnd({ animated: true })
      );
    }, 350);
  }, []);

  React.useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(show, () => {
      setKeyboardOpen(true);
      scrollToFocused();
    });
    const hideSub = Keyboard.addListener(hide, () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToFocused]);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <View className="bg-background flex-1">
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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef as never}
          className="flex-1"
          contentContainerClassName="grow pb-10"
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingHorizontal: SCREEN_PADDING_X,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between">
            <Button size="icon" onPress={goBack} accessibilityLabel="Go back">
              <Icon as={ChevronLeft} className="text-foreground size-5" />
            </Button>
            <View className="bg-card size-12 items-center justify-center rounded-2xl shadow-sm shadow-black/10">
              <Image source={LOGO} style={{ width: 32, height: 32 }} resizeMode="contain" />
            </View>
          </View>

          {keyboardOpen ? null : (
            <View className="mt-8 gap-2">
              <Text className="text-[32px] leading-[38px] font-extrabold tracking-tight">
                {title}
              </Text>
              <Text className="text-muted-foreground text-base leading-6">{subtitle}</Text>
            </View>
          )}

          <ScrollToFocusedContext.Provider value={scrollToFocused}>
            <View className={`gap-5 ${keyboardOpen ? 'mt-5' : 'mt-8'}`}>{children}</View>
          </ScrollToFocusedContext.Provider>
        </ScrollView>

        <View
          className="border-border bg-background gap-3 border-t pt-4"
          style={{
            paddingBottom: keyboardOpen ? 8 : insets.bottom + 8,
            paddingHorizontal: SCREEN_PADDING_X,
          }}>
          {actions}
          {keyboardOpen ? null : (
            <View className="flex-row items-center justify-center">
              <Text className="text-muted-foreground text-[15px]">{footerText}</Text>
              <Button variant="link" size="sm" className="px-1.5" onPress={onFooterPress}>
                <Text className="text-[15px] font-bold">{footerAction}</Text>
              </Button>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
