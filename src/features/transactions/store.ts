import { createStore } from '@/lib/store';
import { DUMMY_TRANSACTIONS } from './dummy';

const store = createStore(
  { transactions: DUMMY_TRANSACTIONS },
  { persist: 'transactions', scope: 'account' }
);

export const useTransactions = store.useValue;
