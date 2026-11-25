import {
  markMedicines,
  recordsKeys,
  setTodoDone,
  useCarePlanStore,
  useConsultations,
  useReferrals,
  type CarePlanStore,
} from '@/api/records';
import { queryClient } from '@/api/query-client';
import { createStore } from '@/lib/store';
import * as React from 'react';
import { Alert } from 'react-native';
import { buildEncounters, parseReferrals } from './build';
import type { CareMedication, CarePlanData, PersonalTodo } from './types';

const MAX_PAGES = 10;

// The patient's own checklist items. These live on the phone; the backend has no list for them.
const personal = createStore<{ todos: PersonalTodo[] }>(
  { todos: [] },
  { persist: 'care-plan-local', scope: 'account' }
);

// The last care plan the server sent, so the screen opens with it while offline.
type Snapshot = Pick<CarePlanData, 'encounters' | 'referrals' | 'done'> & { savedAt: number };
const snapshot = createStore<Snapshot>(
  { encounters: [], referrals: [], done: {}, savedAt: 0 },
  { persist: 'care-plan-v2', scope: 'account' }
);

export type CarePlanState = CarePlanData & {
  // True only on the very first load, before anything has been saved.
  loading: boolean;
  failed: boolean;
};

let loadingPages = false;

export function useCarePlan(): CarePlanState {
  const saved = snapshot.use();
  const { todos } = personal.use();
  const consultations = useConsultations();
  const referrals = useReferrals();
  const store = useCarePlanStore();

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = consultations;
  const pages = consultations.data ? Math.ceil(consultations.data.length / 20) : 0;
  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || loadingPages || pages >= MAX_PAGES) return;
    loadingPages = true;
    fetchNextPage().finally(() => {
      loadingPages = false;
    });
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, pages]);

  const ready = Boolean(consultations.data && store.data && referrals.data);
  const live = React.useMemo(() => {
    if (!consultations.data || !store.data || !referrals.data) return null;
    const { owned, externals, results, done } = store.data;
    const resulted = new Set(results.flatMap((file) => file.testIds));
    return {
      encounters: buildEncounters(consultations.data, owned, resulted, externals),
      referrals: parseReferrals(referrals.data),
      done: Object.fromEntries(Object.keys(done).map((key) => [key, true])),
    };
  }, [consultations.data, store.data, referrals.data]);

  // Saves once the last page has landed, not after every page.
  React.useEffect(() => {
    if (live && !hasNextPage) snapshot.set({ ...live, savedAt: Date.now() });
  }, [live, hasNextPage]);

  const data = live ?? saved;
  const empty = !saved.savedAt && !ready;
  const pending = consultations.isPending || referrals.isPending || store.isPending;
  const errored = consultations.isError || referrals.isError || store.isError;
  return {
    encounters: data.encounters,
    referrals: data.referrals,
    done: data.done,
    todos,
    loading: empty && pending && !errored,
    failed: empty && errored,
  };
}

const tell = (title: string) => (error: unknown) =>
  Alert.alert(title, error instanceof Error ? error.message : 'Please try again.');

// Ticks a to-do item off or back on.
export function toggleDone(key: string) {
  const now = queryClient.getQueryData<CarePlanStore>(recordsKeys.carePlan)?.done[key];
  setTodoDone(key, !now).catch(tell("Couldn't update your to-do"));
}

export function toggleTodo(id: string) {
  personal.set((data) => ({
    todos: data.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
  }));
}

export function addTodo(title: string, note: string) {
  personal.set((data) => ({
    todos: [{ id: `todo-${Date.now()}`, title, note, done: false }, ...data.todos],
  }));
}

export function askOwned(med: CareMedication) {
  Alert.alert(
    `You already have ${med.name}?`,
    'This can’t be undone. Once you mark it as owned, it can’t be ordered again from this prescription. A new prescription is needed to order it again.',
    [
      { text: 'Not yet', style: 'cancel' },
      {
        text: 'Yes, I have it',
        onPress: () => markMedicines([med.id], 'owned').catch(tell("Couldn't mark it as owned")),
      },
    ]
  );
}
