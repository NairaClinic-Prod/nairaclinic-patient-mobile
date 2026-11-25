import { createStore } from '@/lib/store';
import { Uniwind } from 'uniwind';

export type ThemeChoice = 'system' | 'light' | 'dark';

export type SettingsState = {
  ready: boolean;
  theme: ThemeChoice;
  topics: Record<string, boolean>;
  channels: Record<string, boolean>;
};

const store = createStore<SettingsState>(
  {
    ready: false,
    theme: 'system',
    topics: { reminders: true, appointments: true, orders: true, labs: true, offers: false },
    channels: { push: true, whatsapp: true, sms: false, email: false },
  },
  {
    persist: 'settings',
    scope: 'device',
    partialize: ({ theme, topics, channels }) => ({ theme, topics, channels }),
    onHydrated: (state) => Uniwind.setTheme(state.theme),
  }
);

store.hydrated().then(() => store.set((state) => ({ ...state, ready: true })));

export const useSettings = store.use;

export function setTheme(theme: ThemeChoice) {
  Uniwind.setTheme(theme);
  store.set((state) => ({ ...state, theme }));
}

export function setTopic(key: string, on: boolean) {
  store.set((state) => ({ ...state, topics: { ...state.topics, [key]: on } }));
}

export function setChannel(key: string, on: boolean) {
  store.set((state) => ({ ...state, channels: { ...state.channels, [key]: on } }));
}
