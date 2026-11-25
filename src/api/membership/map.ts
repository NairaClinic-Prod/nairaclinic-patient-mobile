import type { CurrentPlan, MembershipTier, RawMembershipMe, RawPlan } from './type';

export function toTier(raw: RawPlan): MembershipTier {
  return {
    id: raw.id,
    audience: raw.audience,
    name: raw.name,
    description: raw.description,
    priceNgn: raw.priceNgn,
    priceLabel: raw.priceLabel,
    contact: raw.purchaseMode === 'contact',
    benefits: [...raw.benefits],
  };
}

export function toCurrentPlan(me: {
  subscription: RawMembershipMe['subscription'];
  billing: RawMembershipMe['billing'];
}): CurrentPlan | null {
  const { subscription, billing } = me;
  if (!subscription) return null;
  return {
    tierId: subscription.plan.id,
    includedVisits: subscription.usage?.includedGpConsultations ?? 0,
    usedVisits: subscription.usage?.usedGpConsultations ?? 0,
    activeUntil: billing?.endsAtUtc ?? subscription.currentPeriodEndUtc,
    renewalCancelled: billing ? !billing.autoRenew : (subscription.cancelAtPeriodEnd ?? true),
  };
}
