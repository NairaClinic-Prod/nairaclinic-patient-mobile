import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { membershipApi } from './endpoint.api';
import { toCurrentPlan, toTier } from './map';

export * from './type';
export { membershipApi } from './endpoint.api';
export { MEMBERSHIP_ENDPOINTS } from './endpoints';
export { toCurrentPlan, toTier } from './map';

export const membershipKeys = {
  all: ['membership'] as const,
  plans: ['membership', 'plans'] as const,
  me: ['membership', 'me'] as const,
  quote: (planId: string) => ['membership', 'quote', planId] as const,
};

export const useMembershipPlans = () =>
  useQuery({
    queryKey: membershipKeys.plans,
    queryFn: async () => (await membershipApi.plans()).map(toTier),
    staleTime: 5 * 60_000,
  });

export const useMembershipAccount = () =>
  useQuery({
    queryKey: membershipKeys.me,
    queryFn: () => membershipApi.me(),
    staleTime: 60_000,
  });

export const useMembershipQuote = (planId: string | null) =>
  useQuery({
    queryKey: membershipKeys.quote(planId ?? ''),
    queryFn: () => membershipApi.quote(planId as string),
    enabled: Boolean(planId),
    staleTime: 30_000,
  });

export async function checkoutMembership(body: {
  planId: string;
  callbackUrl?: string;
  paymentMethodId?: string;
}) {
  const reply = await membershipApi.checkout(body);
  await queryClient.invalidateQueries({ queryKey: membershipKeys.all });
  return reply;
}

export async function cancelMembershipRenewal() {
  await membershipApi.cancelRenewal();
  await queryClient.invalidateQueries({ queryKey: membershipKeys.me });
}
