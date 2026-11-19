import { Onboarding } from '@/components/onboarding/onboarding';
import { Stack } from 'expo-router';

const SCREEN_OPTIONS = {
  headerShown: false,
};

export default function Screen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <Onboarding />
    </>
  );
}
