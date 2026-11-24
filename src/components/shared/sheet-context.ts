import * as React from 'react';
import type { HostInstance } from 'react-native';

type SheetScroll = { reveal: (field: React.RefObject<HostInstance | null>) => void };

export const SheetScrollContext = React.createContext<SheetScroll | null>(null);

export const useSheetScroll = () => React.useContext(SheetScrollContext);
