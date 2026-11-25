import { request } from '../client';
import type { ConsultationDetail, DoctorSlot, RescheduleBody, RescheduleEligibility } from './type';

const id = (value: string) => encodeURIComponent(value);

export const consultationsApi = {
  detail: (consultationId: string) =>
    request<ConsultationDetail>(`/consultations/${id(consultationId)}`),

  eligibility: (consultationId: string) =>
    request<RescheduleEligibility>(`/consultations/${id(consultationId)}/reschedule-eligibility`),

  // The doctor's open times for the next two weeks.
  doctorSlots: (doctorUserId: string) =>
    request<{ slots: DoctorSlot[] }>(
      `/doctors/${id(doctorUserId)}/slots?to=${encodeURIComponent(new Date(Date.now() + 14 * 86_400_000).toISOString())}`
    ).then((reply) =>
      reply.slots.filter((slot) => new Date(slot.startAtUtc).getTime() > Date.now())
    ),

  reschedule: (consultationId: string, body: RescheduleBody) =>
    request<{ scheduledAtUtc?: string | null }>(
      `/consultations/${id(consultationId)}/reschedule-request`,
      {
        body,
      }
    ),
};
