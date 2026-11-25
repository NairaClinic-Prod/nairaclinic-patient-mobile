import {
  useDashboard,
  useHomeProfile,
  useOpenSlotDoctors,
  useReferralLink,
  useUnreadCount,
  type HomeData,
} from '@/api/home';
import * as React from 'react';
import { savedHome } from '../store';

export type HomeState = HomeData & {
  // True only on the very first load, before anything has been saved.
  loading: boolean;
  // True when there is nothing to show and the server could not be reached.
  failed: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

// Home, as the server last said it. Each part falls back to the saved copy until its own request lands.
export function useHome(): HomeState {
  const saved = savedHome.use();
  const dashboard = useDashboard();
  const profile = useHomeProfile();
  const referral = useReferralLink();
  const unread = useUnreadCount();

  const slugs = (dashboard.data?.careTeam ?? []).flatMap((member) =>
    member.bookingSlug ? [member.bookingSlug] : []
  );
  const openKey = useOpenSlotDoctors(slugs);
  const open = React.useMemo(() => new Set(openKey ? openKey.split('|') : []), [openKey]);

  const data = React.useMemo<HomeData>(
    () => ({
      firstName: profile.data?.patientProfile?.firstName?.trim() || saved.firstName,
      unreadCount: unread.data ?? saved.unreadCount,
      referral: referral.data
        ? { code: referral.data.code, shareUrl: referral.data.shareUrl }
        : saved.referral,
      dashboard: dashboard.data
        ? {
            upcoming: dashboard.data.upcoming,
            readyNow: dashboard.data.readyNow,
            healthTips: dashboard.data.healthTips,
            careTeam: dashboard.data.careTeam.map((member) => ({
              ...member,
              hasOpenSlots: member.bookingSlug ? open.has(member.bookingSlug) : false,
            })),
          }
        : saved.dashboard,
    }),
    [profile.data, unread.data, referral.data, dashboard.data, open, saved]
  );

  const stamp = [dashboard, profile, referral, unread]
    .map((query) => query.dataUpdatedAt)
    .join('|');
  React.useEffect(() => {
    if (!dashboard.data) return;
    savedHome.set({ ...data, savedAt: Date.now() });
    // Only a new server answer is worth saving; `data` itself changes when the saved copy does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp, openKey]);

  const refresh = React.useCallback(async () => {
    await Promise.all([
      dashboard.refetch(),
      profile.refetch(),
      referral.refetch(),
      unread.refetch(),
    ]);
  }, [dashboard, profile, referral, unread]);

  const empty = !saved.savedAt && !dashboard.data;
  return {
    ...data,
    loading: empty && dashboard.isPending,
    failed: empty && dashboard.isError,
    refreshing: dashboard.isRefetching,
    refresh,
  };
}
