import { useQueries, useQuery } from '@tanstack/react-query';
import { homeApi } from './endpoint.api';

export * from './type';
export { homeApi } from './endpoint.api';

export const homeKeys = {
  all: ['home'] as const,
  dashboard: ['home', 'dashboard'] as const,
  profile: ['home', 'profile'] as const,
  referral: ['home', 'referral'] as const,
  unread: ['home', 'unread'] as const,
  slots: (slug: string) => ['home', 'slots', slug] as const,
};

const MINUTE = 60_000;

// Refetches every minute while Home is on screen so "Join now" appears when a meeting starts.
export const useDashboard = () =>
  useQuery({
    queryKey: homeKeys.dashboard,
    queryFn: homeApi.dashboard,
    refetchInterval: MINUTE,
  });

export const useHomeProfile = () =>
  useQuery({ queryKey: homeKeys.profile, queryFn: homeApi.profile, staleTime: 10 * MINUTE });

export const useReferralLink = () =>
  useQuery({ queryKey: homeKeys.referral, queryFn: homeApi.referralLink, staleTime: 60 * MINUTE });

export const useUnreadCount = () =>
  useQuery({
    queryKey: homeKeys.unread,
    queryFn: homeApi.notifications,
    refetchInterval: MINUTE,
    select: (reply) => reply.notifications.filter((row) => row.target === 'single_user').length,
  });

// Booking links (joined with |) of the doctors who have a free slot in the next 30 days.
export function useOpenSlotDoctors(slugs: string[]) {
  return useQueries({
    queries: slugs.map((slug) => ({
      queryKey: homeKeys.slots(slug),
      queryFn: () => homeApi.openSlots(slug),
      staleTime: 5 * MINUTE,
      select: (reply: { slots: unknown[] }) => reply.slots.length > 0,
    })),
    // A plain string, so the result stays equal between renders while nothing changed.
    combine: (results) => slugs.filter((_slug, index) => results[index]?.data === true).join('|'),
  });
}
