export type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  sexAtBirth: string;
  bloodGroup: string;
  genotype: string;
  allergies: string;
  currentMedications: string;
  pastConditions: string;
  language: string;
  altLanguage: string;
  smokingStatus: string;
  alcoholUse: string;
};

export type SavedCard = {
  id: string;
  brand: string | null;
  last4: string;
  expiry: string | null;
  isDefault: boolean;
};

export type WalletInfo = {
  balanceKobo: number;
  monthNetKobo: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
};

export type TransactionKind =
  | 'consultation'
  | 'pharmacy'
  | 'subscription'
  | 'doctor_plan'
  | 'credits'
  | 'community'
  | 'files'
  | 'other';

export type Transaction = {
  id: string;
  reference: string;
  kind: TransactionKind;
  title: string;
  detail: string | null;
  amountKobo: number;
  status: 'paid' | 'refunded';
  at: string;
};

export type BiometricDevice = {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type ProfileState = {
  profile: ProfileData;
  cards: SavedCard[];
  devices: BiometricDevice[];
  wallet: WalletInfo;
  transactions: Transaction[];
};

export type AccountSection =
  | 'personal'
  | 'health'
  | 'preferences'
  | 'payment-methods'
  | 'transactions'
  | 'security';
