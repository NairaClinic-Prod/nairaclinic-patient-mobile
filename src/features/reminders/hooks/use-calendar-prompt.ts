import { createStore } from '@/lib/store';
import * as Calendar from 'expo-calendar';
const SNOOZE_MS = 24 * 60 * 60 * 1000;

type State = { ready: boolean; connected: boolean; snoozedUntil: number };

const store = createStore<State>(
  { ready: false, connected: false, snoozedUntil: 0 },
  {
    persist: 'calendar-prompt',
    scope: 'device',
    partialize: ({ connected, snoozedUntil }) => ({ connected, snoozedUntil }),
  }
);

store.hydrated().then(() => store.set((state) => ({ ...state, ready: true })));

// Cancelling hides the prompt for a day, then it is allowed to ask again.
export function snoozeCalendarPrompt() {
  store.set((state) => ({ ...state, snoozedUntil: Date.now() + SNOOZE_MS }));
}

// Returns true once the user has allowed calendar access.
export async function connectCalendar() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  const granted = status === 'granted';
  store.set((state) => ({
    ...state,
    connected: granted,
    snoozedUntil: granted ? 0 : Date.now() + SNOOZE_MS,
  }));
  return granted;
}

export function useCalendarPrompt() {
  const state = store.useValue();
  const shouldAsk = state.ready && !state.connected && Date.now() >= state.snoozedUntil;
  return { connected: state.connected, shouldAsk, ready: state.ready };
}

export function shouldAskNow() {
  const state = store.get();
  return state.ready && !state.connected && Date.now() >= state.snoozedUntil;
}

export const isCalendarConnected = () => store.get().connected;
