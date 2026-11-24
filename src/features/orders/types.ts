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
  totalKobo: number;
  paid: boolean;
  results: LabResult[];
};

export type OrdersData = {
  orders: PharmacyOrder[];
  requests: ShoppingRequest[];
  labBookings: LabBooking[];
};
