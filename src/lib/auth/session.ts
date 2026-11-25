import type { AuthUser, RefreshResponse, SessionTokens } from '@/api/auth/type';
import { ApiError, send } from '@/api/http';
import { queryClient } from '@/api/query-client';
import { createStore, hydrateStores, resetAccountStores } from '@/lib/store';
import { biometricSupport, confirmWithBiometrics } from './biometrics';
import { KEYS, readSecure, removeSecure, writeSecure } from './secure-storage';

export type SessionStatus = 'booting' | 'signedOut' | 'locked' | 'signedIn';

type SessionState = {
  status: SessionStatus;
  user: AuthUser | null;
  biometrics: boolean;
  expired: boolean;
  returning: boolean;
};

type Tokens = { token: string; refreshToken: string; expiresAt: number };

type StoredSession = { token: string; refreshToken: string; expiresAt: string; user: AuthUser };

const REFRESH_EARLY_MS = 2 * 60 * 1000;
const LOGOUT_WAIT_MS = 4000;

const store = createStore<SessionState>({
  status: 'booting',
  user: null,
  biometrics: false,
  expired: false,
  returning: false,
});

let tokens: Tokens | null = null;
let persisted = false;
let refreshing: Promise<string> | null = null;
let unlockWaiters: Array<() => void> = [];

export const useSession = store.useValue;
export const getSession = store.get;

const toTokens = (value: SessionTokens): Tokens => ({
  token: value.token,
  refreshToken: value.refreshToken,
  expiresAt: Date.parse(value.expiresAt) || Date.now() + 60 * 60 * 1000,
});

async function persist() {
  const { user } = store.get();
  if (!persisted || !tokens || !user) return;
  await writeSecure(KEYS.session, {
    token: tokens.token,
    refreshToken: tokens.refreshToken,
    expiresAt: new Date(tokens.expiresAt).toISOString(),
    user,
  } satisfies StoredSession);
}

function releaseWaiters() {
  const waiting = unlockWaiters;
  unlockWaiters = [];
  waiting.forEach((resolve) => resolve());
}

async function wipe(expired: boolean) {
  tokens = null;
  persisted = false;
  refreshing = null;
  await Promise.all([
    removeSecure(KEYS.session),
    removeSecure(KEYS.biometrics),
    resetAccountStores(),
  ]);
  queryClient.clear();
  const returning = Boolean(await readSecure<string>(KEYS.lastPhone));
  store.set({ status: 'signedOut', user: null, biometrics: false, expired, returning });
  releaseWaiters();
}

// Swaps the refresh token for a new access token. Only one swap runs at a time, because the
// backend treats a reused refresh token as stolen and revokes the whole session.
function refresh(): Promise<string> {
  if (refreshing) return refreshing;
  const current = tokens;
  if (!current) return Promise.reject(new ApiError('Please sign in again.', 401));

  refreshing = send<RefreshResponse>('/auth/refresh', {
    body: { refreshToken: current.refreshToken },
  })
    .then(async (reply) => {
      if (tokens !== current) throw new ApiError('Please sign in again.', 401);
      tokens = {
        token: reply.token,
        refreshToken: reply.refreshToken ?? current.refreshToken,
        expiresAt: Date.parse(reply.expiresAt) || Date.now() + 60 * 60 * 1000,
      };
      await persist();
      return tokens.token;
    })
    .catch(async (error) => {
      const dead =
        error instanceof ApiError &&
        (error.status === 401 || (error.status === 403 && /deactivated/i.test(error.message)));
      if (dead && tokens === current) await wipe(true);
      throw error;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

// A valid access token for the signed-in patient. Waits while the app is locked.
export async function accessToken(): Promise<string> {
  if (store.get().status === 'locked') {
    await new Promise<void>((resolve) => unlockWaiters.push(resolve));
  }
  if (store.get().status !== 'signedIn' || !tokens) {
    throw new ApiError('Please sign in again.', 401);
  }
  if (tokens.expiresAt - Date.now() < REFRESH_EARLY_MS) return refresh();
  return tokens.token;
}

// Called when the backend refused a token we sent. Refreshes once unless another call already did.
export async function tokenRejected(sent: string): Promise<string> {
  if (!tokens) throw new ApiError('Please sign in again.', 401);
  if (tokens.token !== sent) return tokens.token;
  return refresh();
}

export async function bootSession() {
  const [stored, biometricsOn] = await Promise.all([
    readSecure<StoredSession>(KEYS.session),
    readSecure<boolean>(KEYS.biometrics),
    hydrateStores(),
  ]);
  if (!stored?.refreshToken || !stored.user?.id) {
    await wipe(false);
    return;
  }

  tokens = toTokens(stored);
  persisted = true;
  const support = biometricsOn ? await biometricSupport() : null;
  const lockIt = Boolean(biometricsOn && support?.available);

  store.set({
    status: lockIt ? 'locked' : 'signedIn',
    user: stored.user,
    biometrics: lockIt,
    expired: false,
    returning: true,
  });
  if (biometricsOn && !lockIt) await removeSecure(KEYS.biometrics);

  // A session the backend has revoked (signed out elsewhere, PIN changed) ends here, not on the first screen.
  if (!lockIt) refresh().catch(() => undefined);
}

export async function signIn(
  session: SessionTokens & { user: AuthUser },
  options: { remember: boolean }
) {
  queryClient.clear();
  tokens = toTokens(session);
  persisted = options.remember;
  const user = { id: session.user.id, userType: session.user.userType, phone: session.user.phone };
  store.set({ status: 'signedIn', user, biometrics: false, expired: false, returning: true });
  if (user.phone) await writeSecure(KEYS.lastPhone, user.phone).catch(() => undefined);
  if (persisted) await persist();
  else await removeSecure(KEYS.session);
  await removeSecure(KEYS.biometrics);
}

// New tokens after a PIN change. The old session is ended on the backend.
export async function replaceTokens(next: SessionTokens) {
  const old = tokens;
  tokens = toTokens(next);
  await persist();
  if (old) {
    send('/auth/logout', { body: { refreshToken: old.refreshToken } }).catch(() => undefined);
  }
}

export async function signOut() {
  const current = tokens;
  if (current) {
    const logout = send('/auth/logout', {
      bearer: current.token,
      body: { refreshToken: current.refreshToken },
    }).catch(() => undefined);
    await Promise.race([logout, new Promise((resolve) => setTimeout(resolve, LOGOUT_WAIT_MS))]);
  }
  await wipe(false);
}

export async function lockSession() {
  const state = store.get();
  if (state.status === 'signedIn' && state.biometrics && persisted) {
    store.set({ ...state, status: 'locked' });
  }
}

export async function unlockSession(): Promise<{ ok: boolean; error?: string }> {
  if (store.get().status !== 'locked') return { ok: true };
  const result = await confirmWithBiometrics('Unlock NairaClinic');
  if (!result.ok) return { ok: false, error: result.error };
  store.set({ ...store.get(), status: 'signedIn' });
  releaseWaiters();
  refresh().catch(() => undefined);
  return { ok: true };
}

// Turning it on keeps this login on the phone, so Face ID can open it next time.
export async function enableBiometrics(): Promise<{ ok: boolean; error?: string }> {
  const support = await biometricSupport();
  if (!support.available) {
    return { ok: false, error: 'Set up Face ID or fingerprint in your phone settings first.' };
  }
  const result = await confirmWithBiometrics('Turn on Face ID or fingerprint sign-in');
  if (!result.ok) return { ok: false, error: result.error };
  persisted = true;
  await persist();
  await writeSecure(KEYS.biometrics, true);
  store.set({ ...store.get(), biometrics: true });
  return { ok: true };
}

export async function disableBiometrics() {
  await removeSecure(KEYS.biometrics);
  store.set({ ...store.get(), biometrics: false });
}

export const lastPhone = () => readSecure<string>(KEYS.lastPhone);

// True once the Face ID offer has been shown on this phone, so it is only asked once.
export async function takeBiometricsOffer() {
  if (await readSecure<boolean>(KEYS.biometricsOffered)) return false;
  await writeSecure(KEYS.biometricsOffered, true).catch(() => undefined);
  return true;
}
