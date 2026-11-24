import * as React from 'react';

// Counts down from the given seconds. It works from a deadline, so it stays right if the app
// was in the background.
export function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = React.useState(() => Date.now() + seconds * 1000);
  const [remaining, setRemaining] = React.useState(seconds);

  React.useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endsAt]);

  const restart = React.useCallback(() => {
    setEndsAt(Date.now() + seconds * 1000);
    setRemaining(seconds);
  }, [seconds]);

  return { remaining, restart };
}
