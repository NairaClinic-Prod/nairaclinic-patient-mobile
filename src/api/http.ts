import { API_URL, REQUEST_TIMEOUT_MS } from './config';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const isNetworkError = (error: unknown) => error instanceof ApiError && error.status === 0;

export type HttpOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  // A file upload. The body is left as form data so the phone sets its own boundary.
  form?: FormData;
  timeoutMs?: number;
  bearer?: string | null;
  signal?: AbortSignal;
};

// Nest replies with { message } as a string, a list of validation messages, or { message, code }.
function messageFrom(json: any, status: number) {
  const raw = json?.message;
  const message = Array.isArray(raw) ? raw[0] : typeof raw === 'object' && raw ? raw.message : raw;
  if (typeof message === 'string' && message.trim()) return message;
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status >= 500) return 'Something went wrong on our side. Please try again.';
  return 'Something went wrong. Please try again.';
}

// One call to the backend with no session handling. Resolves to the reply's `data` (or the body).
export async function send<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const { body, form, bearer, signal, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const method = options.method ?? (body === undefined && !form ? 'GET' : 'POST');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !form ? { 'Content-Type': 'application/json' } : {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      signal?.aborted ? 'Request cancelled.' : "Can't reach NairaClinic. Check your connection.",
      0
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }

  const json = await response.json().catch(() => null);
  if (!response.ok || json?.success === false) {
    const code = json?.code ?? json?.message?.code;
    throw new ApiError(messageFrom(json, response.status), response.status, code);
  }
  return (json?.data ?? json) as T;
}
