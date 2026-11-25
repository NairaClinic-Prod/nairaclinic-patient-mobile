import { createStore } from '@/lib/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import { Uniwind } from 'uniwind';

const KEY = 'nairaclinic.settings';

export type ThemeChoice = 'system' | 'light' | 'dark';

export type SettingsState = {
  ready: boolean;
  theme: ThemeChoice;
  topics: Record<string, boolean>;
  channels: Record<string, boolean>;
};

const store = createStore<SettingsState>({
  ready: false,
  theme: 'system',
  topics: { reminders: true, appointments: true, orders: true, labs: true, offers: false },
  channels: { push: true, whatsapp: true, sms: false, email: false },
});

let loading: Promise<void> | null = null;

function persist() {
  const { theme, topics, channels } = store.get();
  AsyncStorage.setItem(KEY, JSON.stringify({ theme, topics, channels })).catch(() => {});
}

function load() {
  loading ??= AsyncStorage.getItem(KEY)
    .then((raw) => {
      const saved = raw ? (JSON.parse(raw) as Partial<SettingsState>) : {};
      store.set((state) => ({
        ready: true,
        theme: saved.theme ?? state.theme,
        topics: { ...state.topics, ...saved.topics },
        channels: { ...state.channels, ...saved.channels },
      }));
      Uniwind.setTheme(store.get().theme);
    })
    .catch(() => store.set((state) => ({ ...state, ready: true })));
  return loading;
}

export function useSettings() {
  const state = store.use();
  React.useEffect(() => {
    load();
  }, []);
  return state;
}

export function setTheme(theme: ThemeChoice) {
  Uniwind.setTheme(theme);
  store.set((state) => ({ ...state, theme }));
  persist();
}

export function setTopic(key: string, on: boolean) {
  store.set((state) => ({ ...state, topics: { ...state.topics, [key]: on } }));
  persist();
}

export function setChannel(key: string, on: boolean) {
  store.set((state) => ({ ...state, channels: { ...state.channels, [key]: on } }));
  persist();
}
