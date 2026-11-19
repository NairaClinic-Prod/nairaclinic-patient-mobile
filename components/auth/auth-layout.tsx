import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/use-color';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerAction: string;
  onFooterPress: () => void;
  children: React.ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  footerText,
  footerAction,
  onFooterPress,
  children,
}: AuthLayoutProps) {
  const color = useColor();
  const insets = useSafeAreaInsets();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[color.gradientStart, color.gradientMid, color.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow px-6"
          contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Button size="icon" onPress={goBack} accessibilityLabel="Go back">
            <Icon as={ChevronLeft} className="text-foreground size-5" />
          </Button>

          <View className="mt-8 gap-2">
            <Text className="text-[32px] leading-[38px] font-extrabold tracking-tight">
              {title}
            </Text>
            <Text className="text-muted-foreground text-base">{subtitle}</Text>
          </View>

          <View className="mt-8 gap-5">{children}</View>

          <View className="mt-auto flex-row items-center justify-center pt-10">
            <Text className="text-muted-foreground text-[15px]">{footerText}</Text>
            <Button variant="link" size="sm" className="px-1.5" onPress={onFooterPress}>
              <Text className="text-[15px] font-bold">{footerAction}</Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
