import {
  HeaderBar,
  HeaderBarContext,
  type HeaderBarInfo,
} from '@/components/common/collapsing-header';
import { COLLAPSING_TAB_HEADER, SCREEN_PADDING_X } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { cn } from '@/lib/utils';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { KeyboardAvoidingView, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { ScrollContext } from './scroll-context';

type BodyLayoutProps = {
  inset?: boolean;
  padding?: boolean;
  scrollView?: boolean;
  tabBar?: boolean;
  gradient?: boolean;
  collapsingHeader?: boolean;
  fixedHeader?: boolean;
  footer?: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function BodyLayout({
  inset = true,
  padding = true,
  scrollView = false,
  tabBar = false,
  gradient = tabBar,
  collapsingHeader = COLLAPSING_TAB_HEADER,
  fixedHeader = false,
  footer,
  onRefresh,
  refreshing = false,
  className,
  children,
}: BodyLayoutProps) {
  const { top, bottom, tabBar: tabBarSpace } = useScreenInsets();
  const color = useColor();
  const fixed = fixedHeader && scrollView;
  const collapsing = collapsingHeader && scrollView && tabBar && !fixed;
  const active = fixed || collapsing;
  const scrollY = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [info, setInfo] = React.useState<HeaderBarInfo | null>(null);

  const register = React.useCallback(
    (next: Partial<HeaderBarInfo>) =>
      setInfo((current) => ({ title: '', bottom: 0, ...current, ...next })),
    []
  );
  const headerBar = React.useMemo(() => ({ register, fixed }), [register, fixed]);
  const scrollApi = React.useMemo(
    () => ({
      scrollY,
      scrollTo: (y: number) => scrollRef.current?.scrollTo({ y, animated: true }),
    }),
    [scrollY, scrollRef]
  );
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const spacing = {
    paddingTop: inset ? top : 0,
    paddingBottom: footer ? 16 : tabBar ? tabBarSpace : inset ? bottom : 0,
    paddingHorizontal: padding ? SCREEN_PADDING_X : 0,
  };

  const body = (
    <KeyboardAvoidingView behavior="padding" className={cn('flex-1', !gradient && 'bg-background')}>
      {scrollView ? (
        <Animated.ScrollView
          ref={scrollRef}
          className="flex-1"
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerClassName={className}
          contentContainerStyle={[{ flexGrow: 1 }, spacing]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={color.primary}
              />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}>
          {children}
        </Animated.ScrollView>
      ) : (
        <View className={cn('flex-1', className)} style={spacing}>
          {children}
        </View>
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: padding ? SCREEN_PADDING_X : 0,
            paddingBottom: inset ? bottom : 0,
          }}>
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );

  return (
    <HeaderBarContext.Provider value={active ? headerBar : null}>
      <ScrollContext.Provider value={scrollApi}>
        <View className="flex-1 bg-background">
          {gradient ? (
            <LinearGradient
              pointerEvents="none"
              colors={[color.gradientStart, color.gradientMid, color.gradientEnd]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          {body}
          {active && info && (fixed ? info.content : info.title) ? (
            <HeaderBar
              scrollY={scrollY}
              info={info}
              fixed={fixed}
              gutter={padding ? SCREEN_PADDING_X : 0}
            />
          ) : null}
        </View>
      </ScrollContext.Provider>
    </HeaderBarContext.Provider>
  );
}
