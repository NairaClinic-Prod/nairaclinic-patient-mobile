import type { WalletEntry, WalletInfo } from './types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const at = (offset: number) => new Date(Date.now() + offset).toISOString();

export const DUMMY_WALLET: WalletInfo = {
  balanceKobo: 1_268_042,
  accountNumber: '9012345678',
  accountName: 'NAIRACLINIC / AMAKA OBI',
  bankName: 'Wema Bank',
};

export const DUMMY_COINS = 1250;

export const DUMMY_WALLET_HISTORY: WalletEntry[] = [
  { id: 'w1', direction: 'in', amountKobo: 1_000_000, title: 'Wallet top-up', at: at(-2 * HOUR) },
  { id: 'w2', direction: 'out', amountKobo: 580_000, title: 'Pharmacy order', at: at(-1 * DAY) },
  { id: 'w3', direction: 'out', amountKobo: 1_500_000, title: 'Consultation', at: at(-3 * DAY) },
  { id: 'w4', direction: 'in', amountKobo: 250_000, title: 'Refund', at: at(-9 * DAY) },
  { id: 'w5', direction: 'out', amountKobo: 500_000, title: 'Subscription', at: at(-12 * DAY) },
  { id: 'w6', direction: 'in', amountKobo: 2_000_000, title: 'Wallet top-up', at: at(-20 * DAY) },
];
