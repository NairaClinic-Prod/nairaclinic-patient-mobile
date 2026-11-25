import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { walletApi } from './endpoint.api';

export * from './type';
export { walletApi } from './endpoint.api';
export { WALLET_ENDPOINTS } from './endpoints';

export const walletKeys = {
  all: ['wallet'] as const,
  account: ['wallet', 'account'] as const,
  history: ['wallet', 'history'] as const,
};

export const useWalletAccount = () =>
  useQuery({ queryKey: walletKeys.account, queryFn: walletApi.account, staleTime: 15_000 });

export const useWalletHistory = () =>
  useQuery({ queryKey: walletKeys.history, queryFn: walletApi.history });

export const refreshWallet = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: walletKeys.account }),
    queryClient.invalidateQueries({ queryKey: walletKeys.history }),
  ]);
