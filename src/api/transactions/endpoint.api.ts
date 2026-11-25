import { request } from '../client';
import { TRANSACTION_ENDPOINTS } from './endpoints';
import type { TransactionsReply } from './type';

export const transactionsApi = {
  list: () => request<TransactionsReply>(TRANSACTION_ENDPOINTS.me),
};
