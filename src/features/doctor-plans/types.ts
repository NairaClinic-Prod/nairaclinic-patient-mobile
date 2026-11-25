export type DoctorPlan = {
  id: string;
  doctor: string;
  name: string;
  status: 'active' | 'ending' | 'lapsed';
  periodEnd: string;
  nextChargeKobo: number | null;
  card: string | null;
  remaining: { label: string; remaining: number; count: number }[];
};
