import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useScreenInsets() {
  const { top, bottom } = useSafeAreaInsets();
  return React.useMemo(() => ({ top, bottom }), [top, bottom]);
}
