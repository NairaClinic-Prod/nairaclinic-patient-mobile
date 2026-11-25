import { useDashboard } from '@/api/home';
import { useWalletHistory, useWalletQuery, type WalletEntryRow } from '@/api/payments';
import { createStore } from '@/lib/store';
import * as React from 'react';
import type { WalletEntry, WalletInfo } from './types';

type Saved = { wallet: WalletInfo; coins: number; history: WalletEntry[]; savedAt: number };

const EMPTY: Saved = {
  wallet: { balanceKobo: 0, accountNumber: '', accountName: '', bankName: '' },
  coins: 0,
  history: [],
  savedAt: 0,
};

// The last wallet the server sent, so the screen has something to show while offline.
const saved = createStore<Saved>(EMPTY, { persist: 'wallet-v2', scope: 'account' });

const titleOf = (row: WalletEntryRow) => {
  if (row.description?.trim()) return row.description.trim();
  const text = row.reason.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export function useWallet() {
  const snapshot = saved.use();
  const wallet = useWalletQuery();
  const history = useWalletHistory();
  const dashboard = useDashboard();

  const data = React.useMemo<Saved>(() => {
    const account = wallet.data?.wallet;
    return {
      wallet: account
        ? {
            balanceKobo: Number(account.balanceKobo) || 0,
            accountNumber: account.account_number ?? '',
            accountName: account.account_name ?? '',
            bankName: account.bank_name ?? '',
          }
        : snapshot.wallet,
      coins: dashboard.data?.metrics?.walletBalanceTokens ?? snapshot.coins,
      history: history.data
        ? history.data.entries.map((row) => ({
            id: row.id,
            direction: row.direction,
            amountKobo: Number(row.amountKobo) || 0,
            title: titleOf(row),
            at: row.createdAt,
          }))
        : snapshot.history,
      savedAt: snapshot.savedAt,
    };
  }, [wallet.data, history.data, dashboard.data, snapshot]);

  React.useEffect(() => {
    if (wallet.data) saved.set({ ...data, savedAt: Date.now() });
    // Only a new server answer is worth saving.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.dataUpdatedAt, history.dataUpdatedAt]);

  return {
    wallet: data.wallet,
    coins: data.coins,
    history: data.history,
    loading: wallet.isPending && !snapshot.savedAt,
    failed: wallet.isError && !snapshot.savedAt,
    status: wallet.data?.walletStatus ?? 'ready',
    refresh: () => Promise.all([wallet.refetch(), history.refetch()]).then(() => undefined),
  };
}
