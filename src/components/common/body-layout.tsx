import { SCREEN_PADDING_X } from '@/constants/ui';
import { useColor } from '@/hooks/use-color';
import { cn } from '@/lib/utils';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';

type BodyLayoutProps = {
  inset?: boolean;
  padding?: boolean;
  scrollView?: boolean;
  tabBar?: boolean;
  gradient?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function BodyLayout({
  inset = true,
  padding = true,
  scrollView = false,
  tabBar = false,
  gradient = tabBar,
  className,
  children,
}: BodyLayoutProps) {
  const { top, bottom, tabBar: tabBarSpace } = useScreenInsets();
  const color = useColor();

  const spacing = {
    paddingTop: inset ? top : 0,
    paddingBottom: tabBar ? tabBarSpace : inset ? bottom : 0,
    paddingHorizontal: padding ? SCREEN_PADDING_X : 0,
  };

  const body = (
    <KeyboardAvoidingView behavior="padding" className={cn('flex-1', !gradient && 'bg-background')}>
      {scrollView ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={className}
          contentContainerStyle={[{ flexGrow: 1 }, spacing]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1', className)} style={spacing}>
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  );

  if (!gradient) return body;

  return (
    <View className="bg-background flex-1">
      <LinearGradient
        pointerEvents="none"
        colors={[color.gradientStart, color.gradientMid, color.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {body}
    </View>
  );
}
