import { request } from '../client';
import { REMINDER_ENDPOINTS } from './endpoints';
import type { CreateReminderInput, RawReminder } from './type';

export const remindersApi = {
  mine: () =>
    request<{ reminders: RawReminder[] }>(REMINDER_ENDPOINTS.mine).then((reply) => reply.reminders),

  create: (input: CreateReminderInput) =>
    request<{ reminder: RawReminder }>(REMINDER_ENDPOINTS.create, { body: input }).then(
      (reply) => reply.reminder
    ),

  cancel: (id: string) =>
    request<{ success: boolean }>(REMINDER_ENDPOINTS.cancel(id), { body: {} }),
};
