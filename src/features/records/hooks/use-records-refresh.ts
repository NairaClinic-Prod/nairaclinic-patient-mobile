import { recordsKeys } from '@/api/records';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

// Pull-to-refresh for the Records screen: vitals, consultations, referrals and the care plan together.
export function useRecordsRefresh() {
  const queryClient = useQueryClient();
  const [pulled, setPulled] = React.useState(false);
  const fetching = useIsFetching({ queryKey: recordsKeys.all }) > 0;

  const refresh = React.useCallback(async () => {
    setPulled(true);
    try {
      await queryClient.refetchQueries({ queryKey: recordsKeys.all });
    } finally {
      setPulled(false);
    }
  }, [queryClient]);

  return { refresh, refreshing: pulled && fetching };
}
