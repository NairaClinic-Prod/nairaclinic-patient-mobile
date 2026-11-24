import { SCREEN_PADDING_X } from '@/constants/ui';
import { cn } from '@/lib/utils';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import * as React from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';

type BodyLayoutProps = {
  inset?: boolean;
  padding?: boolean;
  scrollView?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function BodyLayout({
  inset = true,
  padding = true,
  scrollView = false,
  className,
  children,
}: BodyLayoutProps) {
  const { top, bottom } = useScreenInsets();

  const spacing = {
    paddingTop: inset ? top : 0,
    paddingBottom: inset ? bottom : 0,
    paddingHorizontal: padding ? SCREEN_PADDING_X : 0,
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
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
}
