import * as React from 'react';
import type { SharedValue } from 'react-native-reanimated';

type ScrollContextValue = {
  scrollY: SharedValue<number>;
  scrollTo: (y: number) => void;
};

export const ScrollContext = React.createContext<ScrollContextValue | null>(null);

export const useScrollContext = () => React.useContext(ScrollContext);
