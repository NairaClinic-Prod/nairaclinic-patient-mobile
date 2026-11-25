import { request } from '../client';
import { WALLET_ENDPOINTS } from './endpoints';
import type { WalletHistoryReply, WalletReply } from './type';

export const walletApi = {
  account: () => request<WalletReply>(WALLET_ENDPOINTS.account),

  history: () => request<WalletHistoryReply>(WALLET_ENDPOINTS.history),
};
