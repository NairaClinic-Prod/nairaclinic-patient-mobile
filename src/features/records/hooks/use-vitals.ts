import { recordsApi, recordsKeys, saveVitals, useVitalsData } from '@/api/records';
import { queryClient } from '@/api/query-client';
import { createStore } from '@/lib/store';
import * as React from 'react';
import type { Reading } from '../types';
import { byNewest } from '../utils';
import { readingsFromVitals, vitalsFromReadings } from '../vitals-map';

// The last vitals the server sent, so the charts open with something while the phone is offline.
const savedVitals = createStore<{ vitalsJson: unknown; savedAt: number }>(
  { vitalsJson: null, savedAt: 0 },
  { persist: 'vitals-v2', scope: 'account' }
);

export function useVitals() {
  const query = useVitalsData();
  const saved = savedVitals.use();

  React.useEffect(() => {
    if (query.data !== undefined) savedVitals.set({ vitalsJson: query.data, savedAt: Date.now() });
  }, [query.data]);

  const raw = query.data !== undefined ? query.data : saved.vitalsJson;
  return React.useMemo(() => readingsFromVitals(raw).sort(byNewest), [raw]);
}

// Never edits readings it hasn't seen: with nothing loaded it fetches them first, and fails if it can't.
async function currentVitals() {
  return queryClient.ensureQueryData({ queryKey: recordsKeys.vitals, queryFn: recordsApi.vitals });
}

export async function saveReading(reading: Reading) {
  const raw = await currentVitals();
  const list = readingsFromVitals(raw);
  const next = list.some((item) => item.id === reading.id)
    ? list.map((item) => (item.id === reading.id ? reading : item))
    : [reading, ...list];
  await saveVitals(vitalsFromReadings(raw, next));
}

export async function deleteReading(id: string) {
  const raw = await currentVitals();
  await saveVitals(
    vitalsFromReadings(
      raw,
      readingsFromVitals(raw).filter((item) => item.id !== id)
    )
  );
}
