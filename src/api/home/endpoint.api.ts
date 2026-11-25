import { request } from '../client';
import type {
  DashboardResponse,
  HomeProfileResponse,
  NotificationsResponse,
  OpenSlotsResponse,
  ReferralLinkResponse,
} from './type';

const DAY_MS = 24 * 60 * 60 * 1000;

export const homeApi = {
  dashboard: () => request<DashboardResponse>('/patient/me/dashboard'),
  profile: () => request<HomeProfileResponse>('/patient/me'),
  referralLink: () => request<ReferralLinkResponse>('/patient/me/referral-link', { body: {} }),
  notifications: () =>
    request<NotificationsResponse>('/notifications/me?unreadOnly=true&limit=100'),
  openSlots: (slug: string) => {
    const from = new Date(Date.now() + 20 * 60_000).toISOString();
    const to = new Date(Date.now() + 30 * DAY_MS).toISOString();
    return request<OpenSlotsResponse>(
      `/doctors/public/by-slug/${encodeURIComponent(slug)}/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { auth: 'none' }
    );
  },
};
