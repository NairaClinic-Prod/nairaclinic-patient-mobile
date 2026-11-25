export type PaymentMethod = {
  id: string;
  brand: string | null;
  last4: string;
  expiry: string | null;
  isDefault: boolean;
  createdAt?: string;
};

export type {
  WalletAccount,
  WalletEntryRow,
  WalletHistoryReply,
  WalletReply,
  WalletStatus,
} from '../wallet/type';

// What any payment endpoint may answer: paid at once (wallet or saved card), or a Paystack page to open.
export type PaymentReply = {
  reference?: string;
  status?: string;
  paid?: boolean;
  authorizationUrl?: string;
};

export type PaymentVerify = { status?: string; paid?: boolean };

export type PayOutcome = { paid: true } | { paid: false; message: string };
