import '@/global.css';

import { queryClient } from '@/api/query-client';
import { BiometricsOfferSheet } from '@/features/auth/components/biometrics-offer-sheet';
import { SignOutSheet } from '@/features/auth/components/sign-out-sheet';
import { SessionGate } from '@/features/auth/components/session-gate';
import { bootSession, useSession } from '@/lib/auth/session';
import { FONT_FILES } from '@/lib/fonts';
import { NAV_THEME } from '@/lib/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableFreeze } from 'react-native-screens';
import { useUniwind } from 'uniwind';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

// Screens that are not showing stop rendering until they are shown again.
enableFreeze(true);

export default function RootLayout() {
  const { theme } = useUniwind();
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const { status } = useSession();

  React.useEffect(() => {
    bootSession();
  }, []);

  if ((!fontsLoaded && !fontError) || status === 'booting') return null;

  const signedIn = status === 'signedIn' || status === 'locked';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Protected guard={!signedIn}>
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/sign-up" />
                <Stack.Screen name="auth/forgot-pin" />
              </Stack.Protected>
              <Stack.Protected guard={signedIn}>
                <Stack.Screen name="(protected)" />
              </Stack.Protected>
              <Stack.Protected guard={__DEV__}>
                <Stack.Screen name="sheet-lab" />
              </Stack.Protected>
            </Stack>
            <BiometricsOfferSheet />
            <SignOutSheet />
            <PortalHost />
          </ThemeProvider>
        </BottomSheetModalProvider>
        <SessionGate />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
