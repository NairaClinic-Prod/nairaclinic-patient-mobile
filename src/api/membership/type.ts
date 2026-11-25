export type PlanAudience = 'individual' | 'family' | 'enterprise';

// A plan on the pricing page, as the server sends it.
export type RawPlan = {
  id: string;
  audience: PlanAudience;
  name: string;
  description: string;
  priceNgn: number | null;
  priceLabel: string;
  billingInterval: 'month' | 'custom';
  purchaseMode: 'self_service' | 'contact' | 'free';
  maxMembers: number;
  benefits: readonly string[];
};

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

// What a switch costs right now.
export type MembershipQuote = {
  kind: 'purchase' | 'upgrade' | 'downgrade_scheduled' | 'renewal';
  amountDueKobo: number;
  serviceFeeKobo: number;
};

export type MembershipCheckoutReply = {
  kind: string;
  quote: MembershipQuote;
  payment: { authorizationUrl: string; reference: string } | null;
  note: string | null;
};

export type RawMembershipMe = {
  subscription: {
    plan: { id: string };
    usage: { includedGpConsultations: number; usedGpConsultations: number } | null;
    currentPeriodEndUtc: string;
    cancelAtPeriodEnd: boolean;
    role: string;
  } | null;
  billing: {
    autoRenew: boolean;
    endsAtUtc: string;
    nextChargeKobo: number | null;
    card: { brand: string | null; last4: string; expiry: string | null } | null;
  } | null;
};
