import { remindersApi } from '@/api/reminders';
import { createStore } from '@/lib/store';
import * as React from 'react';
import { nextOccurrence, occurrencesOf } from '../utils';
import type { ReminderDraft, ReminderGroup, ReminderMeta } from '../types';

type Saved = {
  groups: ReminderGroup[];
  // Server one-shots mirrored from each group, so they can be cancelled on edit, pause or resume.
  server: Record<string, string[]>;
};

const store = createStore<Saved>(
  { groups: [], server: {} },
  { persist: 'reminders-v2', scope: 'account' }
);

// A handful at a time: a month of three-times-daily doses is over a hundred posts.
async function eachLimit<T>(items: T[], limit: number, run: (item: T) => Promise<void>) {
  for (let index = 0; index < items.length; index += limit) {
    await Promise.all(items.slice(index, index + limit).map((item) => run(item)));
  }
}

const titleOf = (meta: ReminderMeta) =>
  meta.title.trim() ||
  (meta.kind === 'medication'
    ? 'Take your medication'
    : meta.kind === 'lab'
      ? 'Lab test reminder'
      : 'Reminder');

const detailOf = (meta: ReminderMeta) =>
  [meta.dose, meta.frequency, meta.sourceLine].filter(Boolean).join(' · ') ||
  meta.note.trim() ||
  'Time for your scheduled reminder.';

// Replaces a group's server one-shots with its current schedule. Rolls back what landed when a
// post fails, so a retry never double-notifies.
async function mirrorGroup(id: string, meta: ReminderMeta | null) {
  const previous = store.get().server[id] ?? [];
  if (previous.length) {
    await Promise.all(
      previous.map((reminderId) => remindersApi.cancel(reminderId).catch(() => undefined))
    );
  }
  if (!meta) {
    store.set((state) => ({ ...state, server: { ...state.server, [id]: [] } }));
    return;
  }
  const created: string[] = [];
  try {
    await eachLimit(occurrencesOf(meta), 8, async (at) => {
      const row = await remindersApi.create({
        title: titleOf(meta),
        message: detailOf(meta),
        dueAtUtc: at.toISOString(),
        dataJson: { groupId: id, kind: meta.kind },
      });
      created.push(row.id);
    });
    store.set((state) => ({ ...state, server: { ...state.server, [id]: created } }));
  } catch (error) {
    await Promise.all(
      created.map((reminderId) => remindersApi.cancel(reminderId).catch(() => undefined))
    );
    throw error;
  }
}

const mirrorError =
  "Saved on this phone, but alerts couldn't be switched on. Check your connection and try again.";

export function useReminders() {
  const saved = store.useValue();

  const toggle = React.useCallback(async (id: string): Promise<string | null> => {
    const group = store.get().groups.find((row) => row.id === id);
    if (!group) return null;
    if (group.paused) {
      try {
        await mirrorGroup(id, group.meta);
      } catch {
        return mirrorError;
      }
      store.set((state) => ({
        ...state,
        groups: state.groups.map((row) => (row.id === id ? { ...row, paused: false } : row)),
      }));
      return null;
    }
    store.set((state) => ({
      ...state,
      groups: state.groups.map((row) => (row.id === id ? { ...row, paused: true } : row)),
    }));
    try {
      await mirrorGroup(id, null);
    } catch {
      store.set((state) => ({
        ...state,
        groups: state.groups.map((row) => (row.id === id ? { ...row, paused: false } : row)),
      }));
      return mirrorError;
    }
    return null;
  }, []);

  // Returns an error message, or null when the reminder is saved.
  const save = React.useCallback(
    async (draft: ReminderDraft, replacesId?: string): Promise<string | null> => {
      if (!nextOccurrence(draft)) return 'Choose a time in the future.';
      const id = replacesId ?? `rem-${Date.now()}`;
      const group: ReminderGroup = { id, paused: false, meta: draft };
      try {
        await mirrorGroup(id, draft);
      } catch {
        return mirrorError;
      }
      store.set((state) => ({
        ...state,
        groups: replacesId
          ? state.groups.map((row) => (row.id === replacesId ? group : row))
          : [{ ...group }, ...state.groups],
      }));
      return null;
    },
    []
  );

  return { groups: saved.groups, toggle, save };
}
