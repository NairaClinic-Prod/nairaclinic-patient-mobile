import { createStore } from '@/lib/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import * as React from 'react';

const KEY = 'nairaclinic.calendar-prompt';
const SNOOZE_MS = 24 * 60 * 60 * 1000;

type State = { ready: boolean; connected: boolean; snoozedUntil: number };

const store = createStore<State>({ ready: false, connected: false, snoozedUntil: 0 });

let loading: Promise<void> | null = null;

function persist() {
  const { connected, snoozedUntil } = store.get();
  AsyncStorage.setItem(KEY, JSON.stringify({ connected, snoozedUntil })).catch(() => {});
}

function load() {
  loading ??= AsyncStorage.getItem(KEY)
    .then((raw) => {
      const saved = raw ? (JSON.parse(raw) as Partial<State>) : {};
      store.set({
        ready: true,
        connected: Boolean(saved.connected),
        snoozedUntil: Number(saved.snoozedUntil) || 0,
      });
    })
    .catch(() => store.set((state) => ({ ...state, ready: true })));
  return loading;
}

// Cancelling hides the prompt for a day, then it is allowed to ask again.
export function snoozeCalendarPrompt() {
  store.set((state) => ({ ...state, snoozedUntil: Date.now() + SNOOZE_MS }));
  persist();
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
  persist();
  return granted;
}

export function useCalendarPrompt() {
  const state = store.use();

  React.useEffect(() => {
    load();
  }, []);

  const shouldAsk = state.ready && !state.connected && Date.now() >= state.snoozedUntil;
  return { connected: state.connected, shouldAsk, ready: state.ready };
}

export function shouldAskNow() {
  const state = store.get();
  return state.ready && !state.connected && Date.now() >= state.snoozedUntil;
}

export const isCalendarConnected = () => store.get().connected;
