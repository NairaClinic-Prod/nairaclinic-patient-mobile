import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore as createZustandStore, type StoreApi } from 'zustand/vanilla';

type Wrapped<T> = { value: T };

type StoreOptions<T> = {
  // Saves the store in AsyncStorage under this name, so it survives the app being closed.
  persist?: string;
  // 'account' stores hold the patient's own data and are emptied on sign-out. 'device' stores
  // (theme, prompts) stay with the phone.
  scope?: 'account' | 'device';
  // Picks what to save when only part of the state should outlive the app.
  partialize?: (state: T) => Partial<T>;
  onHydrated?: (state: T) => void;
};

export type AppStore<T> = {
  get: () => T;
  set: (next: T | ((current: T) => T)) => void;
  use: () => T;
  useSelect: <S>(select: (state: T) => S) => S;
  hydrated: () => Promise<void>;
  reset: () => Promise<void>;
};

const PREFIX = 'nc.store.';
const accountStores = new Set<AppStore<any>>();
const persistedStores = new Set<AppStore<any>>();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// A zustand store with an optional AsyncStorage copy. The state sits in { value } so arrays and
// plain values persist the same way objects do.
export function createStore<T>(initial: T, options: StoreOptions<T> = {}): AppStore<T> {
  const name = options.persist;
  let api: StoreApi<Wrapped<T>>;
  let hydration: Promise<void> = Promise.resolve();

  if (name) {
    let finish: () => void = () => undefined;
    hydration = new Promise((resolve) => (finish = resolve));
    api = createZustandStore<Wrapped<T>>()(
      persist(() => ({ value: initial }), {
        name: `${PREFIX}${name}`,
        version: 1,
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          value: (options.partialize ? options.partialize(state.value) : state.value) as T,
        }),
        // Saved fields win, and fields added since the last save keep their defaults.
        merge: (saved, current) => {
          const stored = (saved as Wrapped<T> | undefined)?.value;
          if (stored === undefined) return current;
          return {
            value:
              isPlainObject(stored) && isPlainObject(current.value)
                ? ({ ...current.value, ...stored } as T)
                : stored,
          };
        },
        onRehydrateStorage: () => (state) => {
          if (state) options.onHydrated?.(state.value);
          finish();
        },
      })
    );
  } else {
    api = createZustandStore<Wrapped<T>>()(() => ({ value: initial }));
  }

  const store: AppStore<T> = {
    get: () => api.getState().value,
    set: (next) =>
      api.setState((state) => ({
        value: typeof next === 'function' ? (next as (current: T) => T)(state.value) : next,
      })),
    use: () => useStore(api, (state) => state.value),
    useSelect: (select) => useStore(api, (state) => select(state.value)),
    hydrated: () => hydration,
    reset: async () => {
      api.setState({ value: initial });
      if (name) await AsyncStorage.removeItem(`${PREFIX}${name}`).catch(() => undefined);
    },
  };

  if (name) persistedStores.add(store);
  if (options.scope === 'account') accountStores.add(store);
  return store;
}

// Waits until every saved store has been read back from the phone.
export const hydrateStores = () =>
  Promise.all([...persistedStores].map((store) => store.hydrated())).then(() => undefined);

// Empties the patient's own data, so the next person to sign in on this phone sees none of it.
export const resetAccountStores = () =>
  Promise.all([...accountStores].map((store) => store.reset())).then(() => undefined);
