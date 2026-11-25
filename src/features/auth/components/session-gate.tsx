import { UnlockScreen } from '@/features/auth/screens/unlock-screen';
import { getSession, lockSession, useSession, type SessionStatus } from '@/lib/auth/session';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { AppState } from 'react-native';

const LOCK_AFTER_MS = 60 * 1000;

const isIn = (status: SessionStatus) => status === 'signedIn' || status === 'locked';

// Hides the splash once the session is known, returns to "/" when the session starts or ends, locks the app
// after a minute in the background, and covers everything while it is locked.
export function SessionGate() {
  const { status } = useSession();
  const previous = React.useRef<SessionStatus>('booting');

  React.useEffect(() => {
    const before = previous.current;
    previous.current = status;
    if (status === 'booting' || before === status) return;

    if (isIn(status) && !isIn(before)) SplashScreen.hideAsync();
    else if (status === 'signedOut' && before === 'booting' && getSession().returning) {
      SplashScreen.hideAsync();
    }

    // The screen being shown just stopped existing, so go back to "/" once the guards have settled;
    // it sends signed-in people to Home and everyone else to onboarding or log in.
    if (before !== 'booting' && isIn(status) !== isIn(before)) {
      setTimeout(() => router.replace('/'), 0);
    }
  }, [status]);

  React.useEffect(() => {
    let leftAt = 0;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') leftAt = Date.now();
      else if (next === 'active' && leftAt && Date.now() - leftAt > LOCK_AFTER_MS) {
        leftAt = 0;
        lockSession();
      }
    });
    return () => subscription.remove();
  }, []);

  return status === 'locked' ? <UnlockScreen /> : null;
}
