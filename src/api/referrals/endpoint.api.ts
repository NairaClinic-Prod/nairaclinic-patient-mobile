import { request } from '../client';
import { REFERRAL_ENDPOINTS } from './endpoints';
import type { RawReferralLink } from './type';

export const referralsApi = {
  link: () =>
    request<{ code: string; shareUrl: string; referralCount: number; referrerName: string }>(
      REFERRAL_ENDPOINTS.link,
      { method: 'POST', body: {} }
    ).then((reply): RawReferralLink => ({
      code: reply.code,
      shareUrl: reply.shareUrl,
      referralCount: reply.referralCount,
      referrerName: reply.referrerName,
    })),

  // Applies a referral code while creating an account.
  apply: (referralCode: string) =>
    request<{ applied: boolean }>(REFERRAL_ENDPOINTS.apply, { body: { referralCode } }),
};
