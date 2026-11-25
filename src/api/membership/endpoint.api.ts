import { request } from '../client';
import { MEMBERSHIP_ENDPOINTS } from './endpoints';
import type { MembershipCheckoutReply, MembershipQuote, RawMembershipMe, RawPlan } from './type';

export const membershipApi = {
  plans: () =>
    request<{ plans: RawPlan[] }>(MEMBERSHIP_ENDPOINTS.plans).then((reply) => reply.plans),

  me: () =>
    request<{
      subscription: RawMembershipMe['subscription'];
      billing: RawMembershipMe['billing'];
    }>(MEMBERSHIP_ENDPOINTS.me),

  quote: (planId: string) =>
    request<{ quote: MembershipQuote }>(MEMBERSHIP_ENDPOINTS.quote, { body: { planId } }).then(
      (reply) => reply.quote
    ),

  checkout: (body: { planId: string; callbackUrl?: string; paymentMethodId?: string }) =>
    request<MembershipCheckoutReply>(MEMBERSHIP_ENDPOINTS.checkout, { body }),

  cancelRenewal: () =>
    request<{ success: boolean }>(MEMBERSHIP_ENDPOINTS.cancelRenewal, { body: {} }),

  resume: () => request<{ success: boolean }>(MEMBERSHIP_ENDPOINTS.resume, { body: {} }),
};
