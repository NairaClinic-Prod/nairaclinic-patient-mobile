export type WalletInfo = {
  balanceKobo: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
};

export type WalletEntry = {
  id: string;
  direction: 'in' | 'out';
  amountKobo: number;
  title: string;
  at: string;
};
