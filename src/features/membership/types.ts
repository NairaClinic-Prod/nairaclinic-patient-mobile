export type PlanAudience = 'individual' | 'family' | 'enterprise';

export type MembershipTier = {
  id: string;
  audience: PlanAudience;
  name: string;
  description: string;
  priceNgn: number | null;
  priceLabel: string;
  contact: boolean;
  benefits: string[];
};

export type CurrentPlan = {
  tierId: string;
  includedVisits: number;
  usedVisits: number;
  activeUntil: string;
  renewalCancelled: boolean;
};
