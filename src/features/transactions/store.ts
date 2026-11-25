import { createStore } from '@/lib/store';
import { DUMMY_TRANSACTIONS } from './dummy';

const store = createStore({ transactions: DUMMY_TRANSACTIONS });

export const useTransactions = store.use;
