import * as React from 'react';
import { DUMMY_REMINDERS } from '../dummy';
import type { ReminderDraft, ReminderGroup } from '../types';
import { nextOccurrence } from '../utils';

export function useReminders() {
  const [groups, setGroups] = React.useState<ReminderGroup[]>(DUMMY_REMINDERS);

  const toggle = React.useCallback((id: string) => {
    setGroups((rows) => rows.map((row) => (row.id === id ? { ...row, paused: !row.paused } : row)));
  }, []);

  // Returns an error message, or null once the reminder is saved.
  const save = React.useCallback((draft: ReminderDraft, replacesId?: string): string | null => {
    if (!nextOccurrence(draft)) return 'Choose a time in the future.';
    setGroups((rows) =>
      replacesId
        ? rows.map((row) => (row.id === replacesId ? { id: row.id, paused: false, meta: draft } : row))
        : [{ id: `rem-${Date.now()}`, paused: false, meta: draft }, ...rows]
    );
    return null;
  }, []);

  return { groups, toggle, save };
}
