import { useTransactionsQuery, type Transaction } from '@/api/transactions';
import { createStore } from '@/lib/store';
import * as React from 'react';

// The last transactions the server sent, so the list has something to show while offline.
const saved = createStore<{ transactions: Transaction[] }>(
  { transactions: [] },
  { persist: 'transactions-v2', scope: 'account' }
);

export function useTransactions() {
  const snapshot = saved.useValue();
  const query = useTransactionsQuery();
  React.useEffect(() => {
    if (query.data) saved.set({ transactions: query.data.transactions });
  }, [query.data]);
  const transactions = query.data?.transactions ?? snapshot.transactions;
  return { transactions, totalKobo: query.data?.totalKobo ?? null };
}
