export type PaymentMethod = {
  id: string;
  brand: string | null;
  last4: string;
  expiry: string | null;
  isDefault: boolean;
  createdAt?: string;
};

export type WalletReply = {
  wallet: {
    balanceKobo: string;
    account_number?: string;
    account_name?: string;
    bank_name?: string;
  } | null;
  walletStatus: 'ready' | 'needs_name' | 'pending';
};

export type WalletEntryRow = {
  id: string;
  direction: 'in' | 'out';
  amountKobo: string;
  reason: string;
  description: string | null;
  createdAt: string;
};

export type WalletHistoryReply = { entries: WalletEntryRow[] };

// What any payment endpoint may answer: paid at once (wallet or saved card), or a Paystack page to open.
export type PaymentReply = {
  reference?: string;
  status?: string;
  paid?: boolean;
  authorizationUrl?: string;
};

export type PaymentVerify = { status?: string; paid?: boolean };

export type PayOutcome = { paid: true } | { paid: false; message: string };
