import { OnboardingScreen } from '@/features/onboarding/screens/onboarding-screen';
import { useSession } from '@/lib/auth/session';
import { Redirect } from 'expo-router';

// Always reachable, so no session change can leave the app on an address that no longer exists.
export default function Index() {
  const { status, returning } = useSession();
  if (status === 'signedIn' || status === 'locked') return <Redirect href="/home" />;
  if (returning) return <Redirect href="/auth/login" />;
  return <OnboardingScreen />;
}
