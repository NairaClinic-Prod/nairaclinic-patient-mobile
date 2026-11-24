import {
  SHEET_BOTTOM_SPACE,
  TAB_BAR_CLEARANCE,
  TAB_BAR_HEIGHT,
  TAB_BAR_MIN_BOTTOM,
} from '@/constants/ui';
import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useScreenInsets() {
  const { top, bottom } = useSafeAreaInsets();
  return React.useMemo(
    () => ({
      top,
      bottom,
      tabBar: TAB_BAR_HEIGHT + Math.max(bottom, TAB_BAR_MIN_BOTTOM) + TAB_BAR_CLEARANCE,
    }),
    [top, bottom]
  );
}

export function useSheetBottom() {
  const { bottom } = useSafeAreaInsets();
  return Math.max(bottom, SHEET_BOTTOM_SPACE);
}
