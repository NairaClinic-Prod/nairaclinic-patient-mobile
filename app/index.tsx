import { Onboarding } from '@/components/onboarding/onboarding';
import { Splash } from '@/components/splash/splash';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const SCREEN_OPTIONS = {
  headerShown: false,
};

let splashPlayed = false;

export default function Screen() {
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
        <Onboarding />
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
