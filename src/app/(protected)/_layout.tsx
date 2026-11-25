import { MakeOrderSheet } from '@/features/make-order/components/make-order-sheet';
import { useSession } from '@/lib/auth/session';
import { Redirect, Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: '(entry)' };

export default function ProtectedLayout() {
  const { status } = useSession();

  // Second line of defence behind the root guard: nothing in here renders without a session.
  if (status !== 'signedIn' && status !== 'locked') return <Redirect href="/auth/login" />;

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
