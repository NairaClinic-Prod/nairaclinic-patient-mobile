import { request } from '../client';
import { DOCTOR_PLAN_ENDPOINTS } from './endpoints';
import type { RawDoctorSubscription } from './type';

export const doctorPlansApi = {
  mine: (doctorUserId?: string) =>
    request<{ subscriptions: RawDoctorSubscription[] }>(
      DOCTOR_PLAN_ENDPOINTS.mine(doctorUserId)
    ).then((reply) => reply.subscriptions),

  cancel: (subscriptionId: string) =>
    request<{ success: boolean }>(DOCTOR_PLAN_ENDPOINTS.cancel(subscriptionId), { body: {} }),
};
