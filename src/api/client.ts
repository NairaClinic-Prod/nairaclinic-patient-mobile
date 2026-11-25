import { accessToken, tokenRejected } from '@/lib/auth/session';
import { ApiError, send, type HttpOptions } from './http';

export { ApiError, isNetworkError } from './http';

type RequestOptions = Omit<HttpOptions, 'bearer'> & {
  // 'session' sends the signed-in patient's token (the default), 'none' sends nothing,
  // and { bearer } sends a one-off token such as a sign-up or phone-proof token.
  auth?: 'session' | 'none' | { bearer: string };
};

// Every app call goes through here. Session calls refresh an expired token once and retry.
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = 'session', ...rest } = options;
  if (auth === 'none') return send<T>(path, rest);
  if (typeof auth === 'object') return send<T>(path, { ...rest, bearer: auth.bearer });

  const token = await accessToken();
  try {
    return await send<T>(path, { ...rest, bearer: token });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const fresh = await tokenRejected(token);
    return send<T>(path, { ...rest, bearer: fresh });
  }
}
