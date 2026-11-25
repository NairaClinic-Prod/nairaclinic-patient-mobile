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

// What the server sends: the newest first, plus the lifetime total paid.
export type RawTransaction = Transaction;

export type TransactionsReply = {
  transactions: RawTransaction[];
  totalKobo: number;
};
