import { createStore } from '@/lib/store';
import * as React from 'react';
import { DUMMY_READINGS } from '../dummy';
import type { Reading } from '../types';
import { byNewest } from '../utils';

const store = createStore<Reading[]>(DUMMY_READINGS);

export function useVitals() {
  const readings = store.use();
  return React.useMemo(() => [...readings].sort(byNewest), [readings]);
}

export function saveReading(reading: Reading) {
  store.set((list) =>
    list.some((item) => item.id === reading.id)
      ? list.map((item) => (item.id === reading.id ? reading : item))
      : [reading, ...list]
  );
}

export function deleteReading(id: string) {
  store.set((list) => list.filter((item) => item.id !== id));
}
