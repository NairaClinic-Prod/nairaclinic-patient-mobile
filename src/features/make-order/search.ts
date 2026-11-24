import type { CarePlanData } from '@/features/care-plan/types';
import { formatDate } from '@/features/care-plan/utils';
import type {
  Collection,
  LabResult,
  OrderItem,
  OrderSource,
  PharmacyCombination,
  PharmacyLine,
  PharmacyResult,
} from './types';

const SERVICE_FEE_KOBO = 50_000;
const DELIVERY_BASE_KOBO = 100_000;
const DELIVERY_PER_KM_KOBO = 25_000;

type PharmacyRow = {
  id: string;
  name: string;
  branch: string | null;
  address: string;
  distanceMeters: number;
  etaMinutes: number;
  listed: boolean;
  stock: Record<string, number>;
};

const PHARMACIES: PharmacyRow[] = [
  {
    id: 'ph-1',
    name: 'HealthPlus',
    branch: 'Lekki',
    address: '14 Admiralty Way, Lekki Phase 1',
    distanceMeters: 1800,
    etaMinutes: 22,
    listed: true,
    stock: {
      amoxicillin: 450_000,
      paracetamol: 120_000,
      'vitamin c': 250_000,
      zinc: 180_000,
      metformin: 180_000,
    },
  },
  {
    id: 'ph-2',
    name: 'MedPlus',
    branch: 'Ikoyi',
    address: '8 Awolowo Road, Ikoyi',
    distanceMeters: 4200,
    etaMinutes: 35,
    listed: true,
    stock: { amoxicillin: 480_000, paracetamol: 100_000, 'vitamin c': 260_000, metformin: 190_000 },
  },
  {
    id: 'ph-3',
    name: 'Alpha Pharmacy',
    branch: 'Yaba',
    address: '22 Herbert Macaulay Way, Yaba',
    distanceMeters: 6100,
    etaMinutes: 48,
    listed: true,
    stock: { paracetamol: 110_000, zinc: 170_000, salbutamol: 380_000 },
  },
  {
    id: 'ph-4',
    name: 'Greenlife Pharmacy',
    branch: null,
    address: '5 Bode Thomas Street, Surulere',
    distanceMeters: 7400,
    etaMinutes: 55,
    listed: false,
    stock: {},
  },
  {
    id: 'ph-5',
    name: 'Medicare Plus',
    branch: 'Ikeja',
    address: '31 Allen Avenue, Ikeja',
    distanceMeters: 9800,
    etaMinutes: 70,
    listed: false,
    stock: {},
  },
];

const key = (name: string) =>
  name
    .toLowerCase()
    .replace(/[\d.]+\s*(mg|mcg|ml|g|iu)\b.*$/, '')
    .trim();
const find = (stock: Record<string, number>, name: string) => {
  const wanted = key(name);
  const hit = Object.keys(stock).find((entry) => wanted.includes(entry) || entry.includes(wanted));
  return hit ? stock[hit] : null;
};

const deliveryFor = (row: PharmacyRow, collection: Collection) =>
  collection === 'delivery'
    ? DELIVERY_BASE_KOBO + Math.round((row.distanceMeters / 1000) * DELIVERY_PER_KM_KOBO)
    : 0;

export type WantedItem = { name: string; quantity: number };

export function findPharmacies(items: WantedItem[], collection: Collection): PharmacyResult[] {
  return PHARMACIES.map((row) => {
    const lines: PharmacyLine[] = items.map((item) => {
      const price = find(row.stock, item.name);
      return {
        name: item.name,
        quantity: item.quantity,
        unitPriceKobo: price,
        have: price === null ? 0 : item.quantity,
      };
    });
    const covered = lines.filter((line) => line.have >= line.quantity);
    const subtotal = covered.reduce(
      (sum, line) => sum + (line.unitPriceKobo ?? 0) * line.quantity,
      0
    );
    const delivery = covered.length ? deliveryFor(row, collection) : 0;
    const service = covered.length ? SERVICE_FEE_KOBO : 0;
    return {
      id: row.id,
      name: row.name,
      branch: row.branch,
      address: row.address,
      distanceMeters: row.distanceMeters,
      etaMinutes: row.etaMinutes,
      match: covered.length === items.length ? 'full' : covered.length ? 'partial' : 'none',
      stockListed: row.listed,
      lines,
      subtotalKobo: subtotal,
      deliveryFeeKobo: delivery,
      serviceFeeKobo: service,
      totalKobo: subtotal + delivery + service,
    } satisfies PharmacyResult;
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);
}

// When nobody has everything, each medicine goes to the cheapest pharmacy that does; delivery and fees are charged per pharmacy.
export function combine(
  items: WantedItem[],
  offers: PharmacyResult[],
  collection: Collection
): PharmacyCombination | null {
  const parts = new Map<string, PharmacyLine[]>();
  for (const item of items) {
    let best: { offer: PharmacyResult; kobo: number } | null = null;
    for (const offer of offers) {
      const line = offer.lines.find((entry) => entry.name === item.name);
      if (!line || line.unitPriceKobo === null || line.have < item.quantity) continue;
      const kobo = line.unitPriceKobo * item.quantity;
      if (!best || kobo < best.kobo) best = { offer, kobo };
    }
    if (!best) return null;
    const line = best.offer.lines.find((entry) => entry.name === item.name) as PharmacyLine;
    parts.set(best.offer.id, [...(parts.get(best.offer.id) ?? []), line]);
  }
  if (parts.size < 2) return null;
  const rows = [...parts.entries()].map(([id, lines]) => {
    const pharmacy = offers.find((offer) => offer.id === id) as PharmacyResult;
    const row = PHARMACIES.find((entry) => entry.id === id) as PharmacyRow;
    const subtotal = lines.reduce(
      (sum, line) => sum + (line.unitPriceKobo ?? 0) * line.quantity,
      0
    );
    return {
      pharmacy,
      lines,
      subtotalKobo: subtotal,
      deliveryFeeKobo: deliveryFor(row, collection),
      serviceFeeKobo: SERVICE_FEE_KOBO,
    };
  });
  return {
    parts: rows,
    totalKobo: rows.reduce(
      (sum, part) => sum + part.subtotalKobo + part.deliveryFeeKobo + part.serviceFeeKobo,
      0
    ),
  };
}

type LabRow = {
  id: string;
  labName: string;
  branchName: string;
  address: string;
  distanceKm: number;
  labVisits: boolean;
  homeCollection: boolean;
  homeFeeKobo: number;
  turnaroundHours: number;
  tests: Record<string, number>;
};

const LABS: LabRow[] = [
  {
    id: 'lab-a',
    labName: 'Lifecare Diagnostics',
    branchName: 'Lekki',
    address: '12 Admiralty Way, Lekki Phase 1',
    distanceKm: 1.6,
    labVisits: true,
    homeCollection: true,
    homeFeeKobo: 300_000,
    turnaroundHours: 24,
    tests: {
      'full blood count': 500_000,
      malaria: 250_000,
      'blood sugar': 300_000,
      'chest x-ray': 1_200_000,
    },
  },
  {
    id: 'lab-b',
    labName: 'Synlab',
    branchName: 'Victoria Island',
    address: '3 Akin Adesola Street, Victoria Island',
    distanceKm: 3.9,
    labVisits: true,
    homeCollection: true,
    homeFeeKobo: 400_000,
    turnaroundHours: 12,
    tests: { 'full blood count': 550_000, malaria: 280_000, 'blood sugar': 320_000 },
  },
  {
    id: 'lab-c',
    labName: 'Clina Lancet',
    branchName: 'Ikoyi',
    address: '17 Bourdillon Road, Ikoyi',
    distanceKm: 5.2,
    labVisits: true,
    homeCollection: false,
    homeFeeKobo: 0,
    turnaroundHours: 48,
    tests: { 'full blood count': 480_000, 'chest x-ray': 1_100_000 },
  },
  {
    id: 'lab-d',
    labName: 'Medilab Express',
    branchName: 'Yaba',
    address: '9 Sabo Road, Yaba',
    distanceKm: 8.4,
    labVisits: false,
    homeCollection: true,
    homeFeeKobo: 350_000,
    turnaroundHours: 36,
    tests: { malaria: 240_000, 'blood sugar': 290_000 },
  },
];

const labPrice = (tests: Record<string, number>, name: string) => {
  const wanted = name.toLowerCase();
  const hit = Object.keys(tests).find((entry) => wanted.includes(entry) || entry.includes(wanted));
  return hit ? tests[hit] : null;
};

export function findLabs(testNames: string[], collection: Collection): LabResult[] {
  return LABS.filter((lab) => (collection === 'home' ? lab.homeCollection : lab.labVisits))
    .map((lab) => {
      const matched = testNames.map((requested) => ({
        requested,
        priceKobo: labPrice(lab.tests, requested),
      }));
      return {
        id: lab.id,
        labName: lab.labName,
        branchName: lab.branchName,
        address: lab.address,
        distanceKm: lab.distanceKm,
        labVisits: lab.labVisits,
        homeCollection: lab.homeCollection,
        homeFeeKobo: lab.homeFeeKobo,
        turnaroundHours: lab.turnaroundHours,
        matched,
        matchedCount: matched.filter((entry) => entry.priceKobo !== null).length,
        subtotalKobo: matched.reduce((sum, entry) => sum + (entry.priceKobo ?? 0), 0),
      } satisfies LabResult;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function medicationSources(data: CarePlanData): OrderSource[] {
  return data.encounters
    .map((encounter) => {
      const left = encounter.medications.filter((med) => med.state === 'available');
      return {
        id: encounter.id,
        title: encounter.title,
        meta: `${formatDate(encounter.dateIso)} · ${
          encounter.external ? encounter.clinic : encounter.doctor
        } · ${left.length} ${left.length === 1 ? 'medicine' : 'medicines'} still to order`,
        external: encounter.external,
        items: left.map((med): OrderItem => ({
          name: [med.name, med.strength].filter(Boolean).join(' '),
          detail: [med.dose, med.frequency].filter(Boolean).join(' · ') || undefined,
        })),
      };
    })
    .filter((source) => source.items.length > 0);
}

export function labSources(data: CarePlanData): OrderSource[] {
  return data.encounters
    .map((encounter) => {
      const waiting = encounter.tests.filter((test) => test.status === 'awaiting');
      return {
        id: encounter.id,
        title: encounter.title,
        meta: `${formatDate(encounter.dateIso)} · ${
          encounter.external ? encounter.clinic : encounter.doctor
        } · ${waiting.length} ${waiting.length === 1 ? 'test' : 'tests'}`,
        external: encounter.external,
        items: waiting.map((test): OrderItem => ({ name: test.name, detail: test.sample })),
      };
    })
    .filter((source) => source.items.length > 0);
}
