export type { LabBooking, LabBookingStatus, LabResult as LabReport } from '../orders/type';

export type LabPoint = { lat: number; lng: number };
export type LabCollection = 'lab_visit' | 'home';
export type ResultDelivery = 'delivery' | 'collection';

// One laboratory branch that can do some of the requested tests, as the search page lists it.
export type LabOption = {
  id: string;
  labName: string;
  branchName: string;
  address: string;
  distanceKm: number | null;
  labVisits: boolean;
  homeCollection: boolean;
  homeFeeKobo: number;
  homeAreas: string[];
  turnaroundHours: number;
  matched: { requested: string; priceKobo: number | null; testId: string | null }[];
  matchedCount: number;
  subtotalKobo: number;
};

export type PriceReply = {
  id: string;
  branchId: string;
  lab: string;
  note: string;
  totalKobo: number;
  homeCollection: boolean;
};

export type PriceRequest = {
  id: string;
  reference: string;
  tests: string[];
  area: string;
  collection: LabCollection;
  status: string;
  expiresAt: string;
  replies: PriceReply[];
};

export type LabSlot = { start: string; end: string; remaining: number };

export type LabHours = { day: number; open: boolean; from: string; to: string };

export type LabQuoteInput = {
  branchId: string;
  testIds?: string[];
  responseId?: string;
  packageId?: string;
  packageTestIds?: string[];
  platformPackageId?: string;
  consultationId?: string;
  collection?: LabCollection;
  resultDelivery?: ResultDelivery;
};

export type LabQuote = {
  lines: { name: string; sample: string; priceKobo: number }[];
  requiresFacilityVisit: boolean;
  blockingTests: { name: string }[];
  allowedCollectionOptions: LabCollection[];
  allowedResultDelivery: ResultDelivery[];
  facility: { address: string; area: string; phone: string | null; hours: LabHours[] };
  fees: { homeCollectionKobo: number; resultDeliveryKobo: number };
  pricing: {
    testsSubtotalKobo: number;
    collectionFeeKobo: number;
    deliveryFeeKobo: number;
    serviceFeeKobo: number;
    totalKobo: number;
  };
};

export type NewLabBooking = LabQuoteInput & {
  collection: LabCollection;
  resultDelivery: ResultDelivery;
  slotStart: string;
  contactName: string;
  contactPhone: string;
  address?: string;
  area?: string;
  deliveryAddress?: string;
};

export type NewPriceRequest = {
  area: string;
  collection: LabCollection;
  tests: string[];
  point?: LabPoint;
  note?: string;
  consultationId?: string;
  contactName: string;
  contactPhone: string;
};

// A test in a branch catalogue, as the branch page lists it.
export type LabCatalogueTest = {
  id: string;
  name: string;
  category: string;
  sample: string;
  priceKobo: number;
  turnaroundHours: number | null;
  requiresPresence: boolean | null;
  kind: 'lab' | 'procedure';
  description: string;
};

// A test inside a package, with its share of the package price.
export type LabPackageTest = {
  id: string;
  name: string;
  sample: string;
  description: string;
  priceKobo: number;
  shareKobo: number;
  requiresPresence: boolean | null;
  kind: 'lab' | 'procedure';
  turnaroundHours: number | null;
};

export type LabPackageSummary = {
  id: string;
  branchId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceKobo: number;
  individualTotalKobo: number;
  savingsKobo: number;
  kind: 'lab' | 'procedure' | 'mixed';
  bookable: boolean;
  tests: LabPackageTest[];
};

// A lab-made package in the browse list, with the branch it belongs to.
export type LabPackageListItem = LabPackageSummary & {
  lab: { name: string; branchName: string; area: string; address: string };
  distanceKm: number | null;
  inArea: boolean;
};

export type LabBranchSummary = {
  id: string;
  labName: string;
  name: string;
  area: string;
  address: string;
  phone: string | null;
  labVisits: boolean;
  homeCollection: boolean;
  homeFeeKobo: number;
  homeAreas: string[];
  hours: LabHours[];
};

export type LabPackageDetail = {
  package: LabPackageSummary;
  branch: LabBranchSummary;
};

export type BranchDetail = {
  branch: LabBranchSummary;
  tests: LabCatalogueTest[];
  packages: LabPackageSummary[];
};

// A branch that offers a platform package, as the package page lists it.
export type PackageLabOption = {
  id: string;
  labName: string;
  branchName: string;
  area: string;
  address: string;
  labVisits: boolean;
  homeCollection: boolean;
  homeFeeKobo: number;
  homeAreas: string[];
  hours: LabHours[];
  inArea: boolean;
  distanceKm: number | null;
  turnaroundHours: number;
};

// What the server sends for a search result and a booking. Only the fields the screens use.
export type RawTest = {
  id: string;
  name: string;
  priceKobo: number;
  turnaroundHours: number;
};

export type RawSearchResult = {
  branch: {
    id: string;
    labName: string;
    name: string;
    area: string;
    address: string;
    labVisits: boolean;
    homeCollection: boolean;
    homeFeeKobo: number;
    homeAreas?: string[];
  };
  distanceKm: number | null;
  matched: { requested: string; test: RawTest | null }[];
};

export type RawBooking = {
  id: string;
  reference: string;
  status:
    | 'pending_payment'
    | 'booked'
    | 'collector_assigned'
    | 'checked_in'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  lab: { name: string; branchName: string; address: string; phone: string | null };
  collection: LabCollection;
  slotStart: string;
  address: string | null;
  resultDelivery?: ResultDelivery;
  deliveryStatus?: 'pending' | 'dispatched' | 'delivered' | null;
  deliveryFeeKobo?: number;
  collector?: { name: string; phone: string | null } | null;
  items: {
    id: string;
    name: string;
    priceKobo: number;
    reportStatus?: 'awaiting' | 'draft' | 'released';
  }[];
  homeFeeKobo?: number;
  serviceFeeKobo?: number;
  totalKobo: number;
  paid: boolean;
  refundStatus?: string | null;
  cancelReason?: string | null;
  canCancel?: boolean;
  results?: {
    id: string;
    fileName: string;
    testNames: string[];
    releasedAt: string | null;
    url: string | null;
  }[];
};

export type RawPlatformPackage = {
  id: string;
  name: string;
  description: string;
  kind: 'lab' | 'procedure' | 'mixed';
  tests: string[];
  priceKobo: number;
  homeVisit: boolean;
};

export type RawPackageTest = {
  id: string;
  name: string;
  sample: string;
  description: string;
  priceKobo: number;
  shareKobo: number;
  requiresPresence: boolean | null;
  kind: 'lab' | 'procedure';
  status: string;
  turnaroundHours?: number | null;
};

export type RawPackageView = {
  id: string;
  branchId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceKobo: number;
  individualTotalKobo: number;
  savingsKobo: number;
  kind: 'lab' | 'procedure' | 'mixed';
  status: string;
  bookable: boolean;
  tests: RawPackageTest[];
};

export type RawLabPackageListItem = RawPackageView & {
  lab: { name: string; branchName: string; area: string; address: string };
  distanceKm: number | null;
  inArea: boolean;
};

export type RawBranchSummary = {
  id: string;
  labName: string;
  name: string;
  area: string;
  address: string;
  phone: string | null;
  labVisits: boolean;
  homeCollection: boolean;
  homeFeeKobo: number;
  homeAreas: string[];
  hours: LabHours[];
};

export type RawLabPackageDetail = {
  package: RawPackageView;
  branch: RawBranchSummary;
};

export type RawCatalogueTest = {
  id: string;
  branchId: string;
  name: string;
  category: string;
  sample: string;
  priceKobo: number;
  turnaroundHours: number | null;
  requiresPresence: boolean | null;
  kind: 'lab' | 'procedure';
  description: string;
};

export type RawBranchDetail = {
  branch: RawBranchSummary;
  tests: RawCatalogueTest[];
  packages: RawPackageView[];
};

export type RawPackageLab = {
  branch: RawBranchSummary;
  inArea: boolean;
  distanceKm: number | null;
  turnaroundHours: number;
};

export type RawRequest = {
  id: string;
  reference: string;
  area: string;
  collection: LabCollection;
  tests: string[];
  status: string;
  expiresAt: string;
  responses: {
    id: string;
    branchId: string;
    labName: string;
    branchName: string;
    homeCollection: boolean;
    totalKobo: number;
    turnaroundHours: number | null;
    message: string | null;
  }[];
};
