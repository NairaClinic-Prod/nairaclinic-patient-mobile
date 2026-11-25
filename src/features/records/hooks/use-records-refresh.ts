import { recordsKeys } from '@/api/records';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

// Pull-to-refresh for the Records screen: vitals, consultations, referrals and the care plan together.
export function useRecordsRefresh() {
  const queryClient = useQueryClient();
  const refresh = React.useCallback(
    () => queryClient.refetchQueries({ queryKey: recordsKeys.all }),
    [queryClient]
  );
  return { refresh };
}
