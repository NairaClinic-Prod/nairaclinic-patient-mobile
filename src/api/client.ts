import { accessToken, tokenRejected } from '@/lib/auth/session';
import { ApiError, send, sendBinary, type HttpOptions } from './http';

export { ApiError, isNetworkError } from './http';

type RequestOptions = Omit<HttpOptions, 'bearer'> & {
  // 'session' sends the signed-in patient's token (the default), 'none' sends nothing,
  // and { bearer } sends a one-off token such as a sign-up or phone-proof token.
  auth?: 'session' | 'none' | { bearer: string };
};

async function withAuth<T>(
  call: (path: string, options: HttpOptions) => Promise<T>,
  path: string,
  options: RequestOptions
): Promise<T> {
  const { auth = 'session', ...rest } = options;
  if (auth === 'none') return call(path, rest);
  if (typeof auth === 'object') return call(path, { ...rest, bearer: auth.bearer });

  const token = await accessToken();
  try {
    return await call(path, { ...rest, bearer: token });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const fresh = await tokenRejected(token);
    return call(path, { ...rest, bearer: fresh });
  }
}

// Every app call goes through here. Session calls refresh an expired token once and retry.
export const request = <T>(path: string, options: RequestOptions = {}) =>
  withAuth<T>(send, path, options);

// Same, for a file the backend sends back.
export const requestFile = (path: string, options: RequestOptions = {}) =>
  withAuth(sendBinary, path, options);
