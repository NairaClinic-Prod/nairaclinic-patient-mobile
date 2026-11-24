import * as React from 'react';

// A tiny shared store so tabs that show the same data stay in step until the API is wired.
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const get = () => state;

  return {
    get,
    set(next: T | ((current: T) => T)) {
      state = typeof next === 'function' ? (next as (current: T) => T)(state) : next;
      listeners.forEach((listener) => listener());
    },
    use: () => React.useSyncExternalStore(subscribe, get, get),
  };
}
