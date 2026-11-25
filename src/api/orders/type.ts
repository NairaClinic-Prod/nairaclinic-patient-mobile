export type OrderStatus =
  'new' | 'quoted' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'declined' | 'cancelled';

export type OrderView = 'requests' | 'closed' | 'active' | 'history';

export type OrderItem = {
  id: string;
  name: string;
  strength: string;
  quantity: number;
  unitPriceKobo: number | null;
};

export type PharmacyOrder = {
  id: string;
  reference: string;
  shoppingRequestId: string | null;
  status: OrderStatus;
  createdAt: string;
  pharmacyName: string;
  pharmacyAddress: string | null;
  pharmacyState: string | null;
  pharmacyPhone: string | null;
  fulfilment: 'pickup' | 'delivery';
  deliveryArea: string | null;
  items: OrderItem[];
  totalKobo: number | null;
  deliveryFeeKobo: number;
  serviceFeeKobo: number;
  paid: boolean;
  paymentPending: boolean;
  cancellable: boolean;
  collectionCode: string | null;
  declineReason: string | null;
  deliveryStatus: string | null;
  contactName: string;
  contactPhone: string;
  deliveryAddress: string | null;
  trackingUrl: string | null;
  rider: { name: string | null; phone: string | null } | null;
  // Plain words about when the rider arrives, when the server can tell.
  etaText: string | null;
  timeline: { status: OrderStatus; at: string }[];
};

export type RequestItem = {
  id: string;
  name: string;
  status: string;
  quantity: number;
  brand?: string | null;
};

export type OfferLine = { itemId: string; unitPriceKobo: number | null; quantity: number };

export type PharmacyOffer = {
  id: string;
  pharmacyId: string;
  name: string;
  branch: string | null;
  replied: boolean;
  asked: boolean;
  covers: number;
  estimatedTotalKobo: number;
  deliveryFeeKobo: number;
  distanceMeters: number | null;
  etaMinutes: number | null;
  address: string;
  lines: OfferLine[];
};

export type TimelineEntry = { at: string; tone: 'info' | 'good' | 'warn' | 'bad'; text: string };

export type RequestOrder = {
  id: string;
  reference: string;
  status: OrderStatus;
  pharmacyName: string;
  totalKobo: number | null;
  paid: boolean;
};

export type ShoppingRequest = {
  id: string;
  reference: string;
  createdAt: string;
  status: 'open' | 'expired' | 'cancelled';
  fulfilment: 'pickup' | 'delivery';
  area: string | null;
  items: RequestItem[];
  replies: number;
  waiting: number;
  deliveryAddress: string | null;
  expiresAt: string | null;
  offers: PharmacyOffer[];
  timeline: TimelineEntry[];
  orders: RequestOrder[];
  // Filled when the full request has been loaded; the list only has the basics.
  detailed: boolean;
  maxPharmacies: number;
  search: { widerSuggested: boolean; widerText: string; searchedText: string } | null;
  returnPolicy: string | null;
};

export type LabBookingStatus =
  | 'pending_payment'
  | 'booked'
  | 'collector_assigned'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type LabResult = {
  id: string;
  fileName: string;
  testNames: string[];
  releasedAt: string | null;
  url: string | null;
};

export type LabBooking = {
  id: string;
  reference: string;
  status: LabBookingStatus;
  labName: string;
  branchName: string;
  address: string;
  collection: 'lab_visit' | 'home';
  slotStart: string;
  items: { id: string; name: string; priceKobo: number; released: boolean }[];
  homeFeeKobo: number;
  serviceFeeKobo: number;
  deliveryFeeKobo: number;
  totalKobo: number;
  paid: boolean;
  canCancel: boolean;
  resultDelivery: 'delivery' | 'collection';
  deliveryStatus: 'pending' | 'dispatched' | 'delivered' | null;
  collector: { name: string; phone: string | null } | null;
  cancelReason: string | null;
  refundStatus: string | null;
  results: LabResult[];
};

export type OrdersData = {
  orders: PharmacyOrder[];
  requests: ShoppingRequest[];
  labBookings: LabBooking[];
};

// What the server sends. These are only the fields the screens use.
export type RawOrder = {
  id: string;
  reference: string;
  shoppingRequestId?: string | null;
  status: OrderStatus;
  createdAt: string;
  pharmacy: { id: string; name: string; address?: string | null; state?: string | null; phone?: string | null };
  fulfilment: 'pickup' | 'delivery';
  deliveryArea?: string | null;
  deliveryAddress?: string | null;
  items: { id: string; name: string; strength?: string; quantity?: number }[];
  quote?: {
    lines: { itemId: string; unitPriceKobo: number; available: boolean }[];
    deliveryFeeKobo: number;
    serviceFeeKobo?: number;
    totalKobo: number;
    autoPriced?: boolean;
  } | null;
  declineReason?: string | null;
  paidAtUtc?: string | null;
  cancellable?: boolean;
  collectionCode?: string | null;
  delivery?: {
    status: string;
    trackingUrl?: string | null;
    rider?: { name?: string; phone?: string } | null;
    eta?: { phase?: string; minutesLeft?: number | null; at?: string | null; rough?: boolean } | null;
  } | null;
  timeline?: { status: OrderStatus; at: string }[];
};

export type RawOpenRequest = {
  id: string;
  reference?: string;
  createdAt: string;
  status: string;
  expiredAt?: string | null;
  fulfilment?: 'pickup' | 'delivery';
  area?: string | null;
  items: { name: string; status: string; quantity?: number }[];
  replies: number;
  waiting: number;
};

export type RawOffer = {
  id: string;
  pharmacyUserId: string;
  matchType?: 'full' | 'partial' | 'none';
  stockListed?: boolean;
  estimatedSubtotalKobo?: number;
  serviceFeeKobo?: number;
  estimatedTotalKobo?: number;
  deliveryFeeKobo?: number;
  distanceMeters?: number | null;
  etaMinutes?: number | null;
  branchName?: string | null;
  headOfficeName?: string | null;
  covers?: number;
  replied?: boolean;
  askStatus?: string | null;
  lines: {
    shoppingRequestItemId: string;
    quantityOffered?: number;
    unitPriceKobo?: number | null;
  }[];
  pharmacy?: { facilityProfile?: { legalName?: string; addressJson?: unknown } | null } | null;
};

export type RawShopping = {
  id: string;
  status?: string;
  createdAt?: string;
  fulfilment?: 'pickup' | 'delivery';
  deliveryArea?: string | null;
  deliveryAddress?: string | null;
  items: {
    id: string;
    prescribedName: string;
    quantityRequested: number;
    status?: string;
    brand?: string | null;
  }[];
  orders?: {
    id: string;
    reference: string;
    status: OrderStatus;
    pharmacyName: string;
    totalKobo: number | null;
    paid: boolean;
  }[];
  timeline?: { at: string; tone?: 'info' | 'good' | 'warn' | 'bad'; text: string }[];
  engine?: {
    rules?: { maxPharmaciesPerOrder?: number; returnPolicy?: { text?: string } | null };
  } | null;
  offers: RawOffer[];
  search?: {
    scope?: 'near' | 'wide';
    nearRadiusKm?: number;
    wideRadiusKm?: number;
    home?: string | null;
    wider?: string[];
    byArea?: boolean;
    widerSuggested?: boolean;
  };
  // Present on a request the old, one-pharmacy way.
  combination?: {
    totalKobo: number;
    parts: {
      pharmacyUserId: string;
      itemIds: string[];
      subtotalKobo: number;
      deliveryFeeKobo: number;
      serviceFeeKobo: number;
    }[];
  } | null;
};

export type ShoppingQuote = {
  totalKobo: number;
  uncoveredItemIds: string[];
};

export type NewShoppingRequest = {
  prescriptionId?: string;
  externalRecordId?: string;
  fulfilment: 'pickup' | 'delivery';
  urgent?: boolean;
  items: { name: string; quantity: number }[];
  deliveryArea?: string;
  state?: string;
  deliveryLocation: DeliveryLocationBody;
};

export type DeliveryLocationBody = {
  address: string;
  placeId?: string;
  state?: string;
  lga?: string;
  city?: string;
  point?: { lat: number; lng: number };
  mapMode: 'map' | '3d';
};

export type PharmacyChoice = { mode: 'selected'; pharmacyIds: string[] } | { mode: 'broadcast' };
