export type DoctorPlan = {
  id: string;
  doctor: string;
  doctorSlug: string | null;
  name: string;
  status: 'active' | 'ending' | 'lapsed';
  periodEnd: string;
  nextChargeKobo: number | null;
  card: string | null;
  remaining: { label: string; remaining: number; count: number }[];
};

// One included visit row, as the server sends it.
export type RawIncludedVisit = {
  type: 'video' | 'in_person';
  durationMins: number;
  count: number;
  used: number;
  reserved: number;
  remaining: number;
};

export type RawDoctorSubscription = {
  id: string;
  doctor: { name: string | null; bookingSlug: string | null; specialty: string | null };
  terms: { name: string; description: string; priceKobo: number };
  status: 'active' | 'ending' | 'lapsed';
  periodStartUtc: string;
  periodEndUtc: string;
  remaining: RawIncludedVisit[];
  autoRenew: boolean;
  nextChargeKobo: number | null;
  card: { brand: string | null; last4: string; expiry: string | null } | null;
};
