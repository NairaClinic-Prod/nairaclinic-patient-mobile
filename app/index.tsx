import { useColor } from '@/hooks/use-color';
import { Stack } from 'expo-router';
import { View } from 'react-native';

const SCREEN_OPTIONS = {
  headerShown: false,
};

export default function Screen() {
  const color = useColor();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View style={{ flex: 1, backgroundColor: color.background }} />
    </>
  );
}
