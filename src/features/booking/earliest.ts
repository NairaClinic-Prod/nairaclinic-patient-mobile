import { useBookingTiming } from '@/api/booking';
import * as React from 'react';
import { DEFAULT_TIMING, earliestBookingAt } from './utils';

// The earliest time a visit can start, from the admin's setting, refreshed every minute.
export function useEarliestBooking() {
  const timing = useBookingTiming();
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const rule = timing.data ?? DEFAULT_TIMING;
  return earliestBookingAt(now, rule);
}
