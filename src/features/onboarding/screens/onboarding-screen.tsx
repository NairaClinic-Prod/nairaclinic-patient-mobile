import { Onboarding } from '@/features/onboarding/components/onboarding';
import { Splash } from '@/features/onboarding/components/splash';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const SCREEN_OPTIONS = {
  headerShown: false,
};

let splashPlayed = false;

export function OnboardingScreen() {
  const [showSplash, setShowSplash] = React.useState(!splashPlayed);
  const exit = useSharedValue(splashPlayed ? 1 : 0);

  React.useEffect(() => {
    if (splashPlayed) SplashScreen.hideAsync();
  }, []);

  const content = useAnimatedStyle(() => {
    const x = exit.get();
    return {
      opacity: Math.min(1, x * 4),
      transform: [{ translateY: (1 - x) * 28 }, { scale: 0.97 + x * 0.03 }],
    };
  });

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <Animated.View style={[styles.fill, content]}>
        <Onboarding
          onFinish={() => router.push('/auth/sign-up')}
          onSignIn={() => router.push('/auth/login')}
        />
      </Animated.View>
      {showSplash ? (
        <Splash
          exit={exit}
          onDone={() => {
            splashPlayed = true;
            setShowSplash(false);
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
