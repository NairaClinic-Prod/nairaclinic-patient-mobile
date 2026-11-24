import type { Point } from '@/lib/places';

export type OrderKind = 'medication' | 'lab';
export type Collection = 'delivery' | 'pickup' | 'home' | 'lab_visit';

export type LocationDraft = {
  address: string;
  state: string;
  lga: string;
  city: string;
  point?: Point;
  typed: boolean;
};

export const EMPTY_LOCATION: LocationDraft = {
  address: '',
  state: '',
  lga: '',
  city: '',
  typed: false,
};

export type OrderItem = { name: string; detail?: string };

export type OrderSource = {
  id: string;
  title: string;
  meta: string;
  external: boolean;
  items: OrderItem[];
};

export type Match = 'full' | 'partial' | 'none';

export type PharmacyLine = {
  name: string;
  quantity: number;
  unitPriceKobo: number | null;
  have: number;
};

export type PharmacyResult = {
  id: string;
  name: string;
  branch: string | null;
  address: string;
  distanceMeters: number;
  etaMinutes: number;
  match: Match;
  stockListed: boolean;
  lines: PharmacyLine[];
  subtotalKobo: number;
  deliveryFeeKobo: number;
  serviceFeeKobo: number;
  totalKobo: number;
};

export type PharmacyCombination = {
  parts: {
    pharmacy: PharmacyResult;
    lines: PharmacyLine[];
    subtotalKobo: number;
    deliveryFeeKobo: number;
    serviceFeeKobo: number;
  }[];
  totalKobo: number;
};

export type LabMatch = { requested: string; priceKobo: number | null };

export type LabResult = {
  id: string;
  labName: string;
  branchName: string;
  address: string;
  distanceKm: number;
  labVisits: boolean;
  homeCollection: boolean;
  homeFeeKobo: number;
  turnaroundHours: number;
  matched: LabMatch[];
  matchedCount: number;
  subtotalKobo: number;
};
