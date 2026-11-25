import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from './endpoint.api';

export * from './type';
export { transactionsApi } from './endpoint.api';
export { TRANSACTION_ENDPOINTS } from './endpoints';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: ['transactions', 'list'] as const,
};

export const useTransactionsQuery = () =>
  useQuery({
    queryKey: transactionKeys.list,
    queryFn: () => transactionsApi.list(),
    staleTime: 60_000,
  });
