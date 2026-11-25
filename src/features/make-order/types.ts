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
  // The prescription to order from. Outside prescriptions have none; their own id is the source.
  prescriptionId: string | null;
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

export type { LabOption as LabResult } from '@/api/labs';
