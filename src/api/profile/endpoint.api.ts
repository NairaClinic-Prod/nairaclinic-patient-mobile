import { request } from '../client';
import { PROFILE_ENDPOINTS } from './endpoints';
import type { RawMeReply, UpdateProfileBody } from './type';

export const profileApi = {
  me: () =>
    request<{ user: RawMeReply['user']; patientProfile: RawMeReply['patientProfile'] }>(
      PROFILE_ENDPOINTS.me
    ).then((reply) => ({ user: reply.user, patientProfile: reply.patientProfile })),

  update: (body: UpdateProfileBody) =>
    request<{ user: RawMeReply['user']; patientProfile: RawMeReply['patientProfile'] }>(
      PROFILE_ENDPOINTS.me,
      { method: 'PATCH', body }
    ).then((reply) => ({ user: reply.user, patientProfile: reply.patientProfile })),
};
