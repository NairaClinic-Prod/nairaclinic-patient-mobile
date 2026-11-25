import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { remindersApi } from './endpoint.api';

export * from './type';
export { remindersApi } from './endpoint.api';
export { REMINDER_ENDPOINTS } from './endpoints';

export const reminderKeys = {
  all: ['reminders'] as const,
  mine: ['reminders', 'mine'] as const,
};

export const useServerReminders = () =>
  useQuery({
    queryKey: reminderKeys.mine,
    queryFn: () => remindersApi.mine(),
    staleTime: 60_000,
  });

export async function refreshServerReminders() {
  await queryClient.invalidateQueries({ queryKey: reminderKeys.all });
}
