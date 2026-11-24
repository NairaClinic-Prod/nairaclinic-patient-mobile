export type OrderStatus =
  | 'new'
  | 'quoted'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'declined'
  | 'cancelled';

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
};

export type RequestItem = { name: string; status: string; quantity: number };

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
