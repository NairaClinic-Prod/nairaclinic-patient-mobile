import {
  CollapsingBar,
  HeaderBarContext,
  type HeaderBarInfo,
} from '@/components/common/collapsing-header';
import { COLLAPSING_TAB_HEADER, SCREEN_PADDING_X } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { cn } from '@/lib/utils';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

type BodyLayoutProps = {
  inset?: boolean;
  padding?: boolean;
  scrollView?: boolean;
  tabBar?: boolean;
  gradient?: boolean;
  collapsingHeader?: boolean;
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
  className,
  children,
}: BodyLayoutProps) {
  const { top, bottom, tabBar: tabBarSpace } = useScreenInsets();
  const color = useColor();
  const collapsing = collapsingHeader && scrollView && tabBar;
  const scrollY = useSharedValue(0);
  const [info, setInfo] = React.useState<HeaderBarInfo | null>(null);

  const register = React.useCallback(
    (next: Partial<HeaderBarInfo>) =>
      setInfo((current) => ({ title: '', bottom: 0, ...current, ...next })),
    []
  );
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const spacing = {
    paddingTop: inset ? top : 0,
    paddingBottom: tabBar ? tabBarSpace : inset ? bottom : 0,
    paddingHorizontal: padding ? SCREEN_PADDING_X : 0,
  };

  const body = (
    <KeyboardAvoidingView behavior="padding" className={cn('flex-1', !gradient && 'bg-background')}>
      {scrollView ? (
        <Animated.ScrollView
          className="flex-1"
          onScroll={collapsing ? onScroll : undefined}
          scrollEventThrottle={16}
          contentContainerClassName={className}
          contentContainerStyle={[{ flexGrow: 1 }, spacing]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </Animated.ScrollView>
      ) : (
        <View className={cn('flex-1', className)} style={spacing}>
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  );

  return (
    <HeaderBarContext.Provider value={collapsing ? register : null}>
      <View className="bg-background flex-1">
        {gradient ? (
          <LinearGradient
            pointerEvents="none"
            colors={[color.gradientStart, color.gradientMid, color.gradientEnd]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {body}
        {collapsing && info?.title ? <CollapsingBar scrollY={scrollY} info={info} /> : null}
      </View>
    </HeaderBarContext.Provider>
  );
}
