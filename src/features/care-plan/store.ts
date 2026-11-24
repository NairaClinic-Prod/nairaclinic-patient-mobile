import { createStore } from '@/lib/store';
import { Alert } from 'react-native';
import { DUMMY_CARE_PLAN } from './dummy';
import type { CareMedication } from './types';

const store = createStore(DUMMY_CARE_PLAN);

export const useCarePlan = store.use;

export function toggleDone(key: string) {
  store.set((data) => ({ ...data, done: { ...data.done, [key]: !data.done[key] } }));
}

export function toggleTodo(id: string) {
  store.set((data) => ({
    ...data,
    todos: data.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
  }));
}

export function addTodo(title: string, note: string) {
  store.set((data) => ({
    ...data,
    todos: [{ id: `todo-${Date.now()}`, title, note, done: false }, ...data.todos],
  }));
}

function markOwned(id: string) {
  store.set((data) => ({
    ...data,
    encounters: data.encounters.map((encounter) => ({
      ...encounter,
      medications: encounter.medications.map((med) =>
        med.id === id ? { ...med, state: 'owned' as const } : med
      ),
    })),
  }));
}

export function askOwned(med: CareMedication) {
  Alert.alert(
    `You already have ${med.name}?`,
    'This can’t be undone. Once you mark it as owned, it can’t be ordered again from this prescription. A new prescription is needed to order it again.',
    [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Yes, I have it', onPress: () => markOwned(med.id) },
    ]
  );
}
