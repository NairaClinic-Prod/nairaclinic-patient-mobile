// The patient's Naira wallet, as the server sends it. Amounts arrive as kobo strings.
export type WalletAccount = {
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  balanceKobo: string;
  currency?: string;
  active?: boolean;
} | null;

export type WalletStatus = 'ready' | 'needs_name' | 'pending';

export type WalletReply = {
  wallet: WalletAccount;
  walletStatus: WalletStatus;
};

// One line of the wallet history, as the server sends it.
export type WalletEntryRow = {
  id: string;
  direction: 'in' | 'out';
  amountKobo: string;
  reason: string;
  description: string | null;
  refTable?: string;
  refId?: string;
  createdAt: string;
};

export type WalletHistoryReply = { entries: WalletEntryRow[] };
