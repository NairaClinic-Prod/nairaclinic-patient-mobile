import { useQuery } from '@tanstack/react-query';
import { referralsApi } from './endpoint.api';
import type { ReferralLink } from './type';

export * from './type';
export { referralsApi } from './endpoint.api';
export { REFERRAL_ENDPOINTS } from './endpoints';

export const referralKeys = {
  all: ['referrals'] as const,
  link: ['referrals', 'link'] as const,
};

export const useReferralLink = () =>
  useQuery({
    queryKey: referralKeys.link,
    queryFn: async (): Promise<ReferralLink> => {
      const raw = await referralsApi.link();
      return { code: raw.code, shareUrl: raw.shareUrl, joined: raw.referralCount };
    },
    staleTime: 5 * 60_000,
  });
