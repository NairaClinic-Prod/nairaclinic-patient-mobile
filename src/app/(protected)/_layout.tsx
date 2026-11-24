import { MakeOrderSheet } from '@/features/make-order/components/make-order-sheet';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
      <MakeOrderSheet />
    </>
  );
}
