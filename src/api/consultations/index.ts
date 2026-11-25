import { homeKeys } from '@/api/home';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { consultationsApi } from './endpoint.api';
import type { RescheduleBody } from './type';

export * from './type';
export { consultationsApi } from './endpoint.api';

export const consultationKeys = {
  detail: (id: string) => ['consultations', 'detail', id] as const,
  eligibility: (id: string) => ['consultations', 'eligibility', id] as const,
  slots: (doctorUserId: string) => ['consultations', 'slots', doctorUserId] as const,
};

export const useConsultation = (id: string | null) =>
  useQuery({
    queryKey: consultationKeys.detail(id ?? ''),
    queryFn: () => consultationsApi.detail(id as string),
    enabled: Boolean(id),
    staleTime: 15_000,
  });

export const useRescheduleEligibility = (id: string | null, enabled: boolean) =>
  useQuery({
    queryKey: consultationKeys.eligibility(id ?? ''),
    queryFn: () => consultationsApi.eligibility(id as string),
    enabled: Boolean(id) && enabled,
    staleTime: 0,
  });

export const useDoctorSlots = (doctorUserId: string | null, enabled: boolean) =>
  useQuery({
    queryKey: consultationKeys.slots(doctorUserId ?? ''),
    queryFn: () => consultationsApi.doctorSlots(doctorUserId as string),
    enabled: Boolean(doctorUserId) && enabled,
    staleTime: 0,
  });

// Moves the visit, then refreshes everything that shows it.
export async function rescheduleConsultation(id: string, body: RescheduleBody) {
  const reply = await consultationsApi.reschedule(id, body);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) }),
    queryClient.invalidateQueries({ queryKey: consultationKeys.eligibility(id) }),
    queryClient.invalidateQueries({ queryKey: homeKeys.dashboard }),
  ]);
  return reply;
}
