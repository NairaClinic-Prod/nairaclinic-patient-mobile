import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { doctorPlansApi } from './endpoint.api';
import { toDoctorPlan } from './map';

export * from './type';
export { doctorPlansApi } from './endpoint.api';
export { DOCTOR_PLAN_ENDPOINTS } from './endpoints';
export { toDoctorPlan } from './map';

export const doctorPlanKeys = {
  all: ['doctor-plans'] as const,
  mine: (doctorUserId?: string) => ['doctor-plans', 'mine', doctorUserId ?? ''] as const,
};

export const useMyDoctorSubscriptions = (doctorUserId?: string | null) =>
  useQuery({
    queryKey: doctorPlanKeys.mine(doctorUserId ?? undefined),
    queryFn: async () => (await doctorPlansApi.mine(doctorUserId ?? undefined)).map(toDoctorPlan),
    staleTime: 60_000,
  });

export async function cancelDoctorPlan(subscriptionId: string) {
  await doctorPlansApi.cancel(subscriptionId);
  await queryClient.invalidateQueries({ queryKey: doctorPlanKeys.all });
}
