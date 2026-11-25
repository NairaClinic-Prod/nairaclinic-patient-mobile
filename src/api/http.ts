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

// One call with no session handling. Network failures and timeouts become ApiError(status 0).
async function rawFetch(
  path: string,
  options: HttpOptions & { accept?: string }
): Promise<Response> {
  const {
    body,
    form,
    bearer,
    signal,
    timeoutMs = REQUEST_TIMEOUT_MS,
    accept = 'application/json',
  } = options;
  const method = options.method ?? (body === undefined && !form ? 'GET' : 'POST');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);

  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: accept,
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
}

async function failure(response: Response) {
  const json = await response.json().catch(() => null);
  const code = json?.code ?? json?.message?.code;
  return new ApiError(messageFrom(json, response.status), response.status, code);
}

// Resolves to the reply's `data` (or the body).
export async function send<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const response = await rawFetch(path, options);
  const json = await response.json().catch(() => null);
  if (!response.ok || json?.success === false) {
    const code = json?.code ?? json?.message?.code;
    throw new ApiError(messageFrom(json, response.status), response.status, code);
  }
  return (json?.data ?? json) as T;
}

export type BinaryReply = { bytes: Uint8Array; name: string | null; type: string };

// A file the backend sends back, such as a PDF.
export async function sendBinary(path: string, options: HttpOptions = {}): Promise<BinaryReply> {
  const response = await rawFetch(path, { timeoutMs: 60_000, ...options, accept: '*/*' });
  if (!response.ok) throw await failure(response);
  const name = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(
    response.headers.get('content-disposition') ?? ''
  )?.[1];
  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    name: name ? decodeURIComponent(name) : null,
    type: response.headers.get('content-type') ?? 'application/octet-stream',
  };
}
