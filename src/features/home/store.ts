import type { HomeData } from '@/api/home';
import { createStore } from '@/lib/store';

export type SavedHome = HomeData & { savedAt: number };

export const EMPTY_HOME: SavedHome = {
  savedAt: 0,
  firstName: '',
  unreadCount: 0,
  dashboard: { upcoming: [], readyNow: [], healthTips: [], careTeam: [] },
  referral: { code: '', shareUrl: '' },
};

// The last Home the server sent, so the screen opens with something while it refreshes or offline.
export const savedHome = createStore<SavedHome>(EMPTY_HOME, {
  persist: 'home',
  scope: 'account',
});
