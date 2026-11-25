import { APP_LINK, PATIENT_APP_URL } from '@/constants/links';
import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { queryClient } from '../query-client';
import { ApiError } from '../http';
import { request } from '../client';
import { paymentsApi } from './endpoint.api';
import { PAYMENT_ENDPOINTS } from './endpoints';
import type { PaymentMethod, PaymentReply, PayOutcome } from './type';

export * from './type';
export { paymentsApi } from './endpoint.api';
export { PAYMENT_ENDPOINTS } from './endpoints';

export const paymentKeys = {
  wallet: ['payments', 'wallet'] as const,
  history: ['payments', 'history'] as const,
  methods: ['payments', 'methods'] as const,
};

export const useWalletQuery = () =>
  useQuery({ queryKey: paymentKeys.wallet, queryFn: paymentsApi.wallet, staleTime: 15_000 });

export const useWalletHistory = () =>
  useQuery({ queryKey: paymentKeys.history, queryFn: paymentsApi.walletHistory });

export const useMethodsQuery = () =>
  useQuery({ queryKey: paymentKeys.methods, queryFn: paymentsApi.methods, staleTime: 30_000 });

export const refreshPayments = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: paymentKeys.wallet }),
    queryClient.invalidateQueries({ queryKey: paymentKeys.history }),
    queryClient.invalidateQueries({ queryKey: paymentKeys.methods }),
  ]);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Opens Paystack's page, then checks the result a few times, because the confirmation can arrive a
// moment after the browser closes. An auth session (not a plain browser) is used so the "Back to
// the app" link on the callback page dismisses the browser and returns to the app: a plain in-app
// browser swallows custom-scheme taps, which is why that button did nothing. The session is
// ephemeral (private) so iOS skips its "wants to use … to Sign In" consent prompt; Paystack does
// not need the patient's Safari cookies.
async function checkout(url: string, reference: string, onReturn?: () => void): Promise<boolean> {
  try {
    await WebBrowser.openAuthSessionAsync(url, APP_LINK, { preferEphemeralSession: true });
  } catch {
    await WebBrowser.openBrowserAsync(url, { dismissButtonStyle: 'close' });
  }
  onReturn?.();
  for (let attempt = 0; attempt < 4; attempt++) {
    const result = await paymentsApi.verify(reference).catch(() => null);
    if (result?.paid || result?.status === 'paid') return true;
    if (attempt < 3) await wait(1500);
  }
  return false;
}

export type PayRequest = {
  // One of PAYMENT_ENDPOINTS.
  endpoint: string;
  // What that endpoint takes: ids, promo code, saved card id and so on.
  body?: Record<string, unknown>;
  // Appended to the page Paystack returns to, for endpoints that want it.
  callbackQuery?: Record<string, string>;
  // Said if the payment could not be confirmed.
  unconfirmed?: string;
  // Runs when the Paystack page closes, before the result is checked.
  onReturn?: () => void;
};

// Turns what a payment endpoint answered into a result: paid at once (wallet or saved card), or a
// Paystack page to open and check.
export async function settlePayment(
  reply: PaymentReply,
  unconfirmed?: string,
  onReturn?: () => void
): Promise<PayOutcome> {
  let paid: boolean;
  if (reply.paid || reply.status === 'paid') paid = true;
  else if (reply.authorizationUrl && reply.reference) {
    paid = await checkout(reply.authorizationUrl, reply.reference, onReturn);
  } else if (reply.status === 'pending') {
    throw new ApiError("We couldn't start the payment. Please try again.", 502);
  } else paid = true;

  refreshPayments();
  return paid
    ? { paid: true }
    : {
        paid: false,
        message:
          unconfirmed ??
          "We couldn't confirm your payment. If you were charged, it will show up shortly. Otherwise try again.",
      };
}

// Where Paystack sends the patient back to once the app opened its page.
export const paymentCallback = (query: Record<string, string> = {}) =>
  `${PATIENT_APP_URL}/patients/paystack/callback?${new URLSearchParams({ source: 'app', ...query }).toString()}`;

// The one function every payment goes through. It calls the endpoint, and if the server paid straight
// away (wallet or saved card) it is done; if it sent a Paystack page, that page is opened and checked.
export async function pay(input: PayRequest): Promise<PayOutcome> {
  const reply = await request<PaymentReply>(input.endpoint, {
    body: { callbackUrl: paymentCallback(input.callbackQuery), ...input.body },
  });
  return settlePayment(reply, input.unconfirmed, input.onReturn);
}

// Adds a card: a small charge on Paystack's page that is refunded, after which the card is kept.
export async function addCard(): Promise<{ added: boolean }> {
  const before = queryClient.getQueryData<PaymentMethod[]>(paymentKeys.methods)?.length ?? 0;
  await pay({ endpoint: PAYMENT_ENDPOINTS.addCard });
  const methods = await paymentsApi.methods();
  queryClient.setQueryData(paymentKeys.methods, methods);
  return { added: methods.length > before };
}

export async function makeDefaultMethod(id: string) {
  const previous = queryClient.getQueryData<PaymentMethod[]>(paymentKeys.methods);
  queryClient.setQueryData<PaymentMethod[]>(paymentKeys.methods, (list) =>
    list?.map((card) => ({ ...card, isDefault: card.id === id }))
  );
  try {
    queryClient.setQueryData(paymentKeys.methods, await paymentsApi.makeDefault(id));
  } catch (error) {
    queryClient.setQueryData(paymentKeys.methods, previous);
    throw error;
  }
}

export async function removeMethod(id: string) {
  const previous = queryClient.getQueryData<PaymentMethod[]>(paymentKeys.methods);
  queryClient.setQueryData<PaymentMethod[]>(paymentKeys.methods, (list) =>
    list?.filter((card) => card.id !== id)
  );
  try {
    queryClient.setQueryData(paymentKeys.methods, await paymentsApi.removeMethod(id));
  } catch (error) {
    queryClient.setQueryData(paymentKeys.methods, previous);
    throw error;
  }
}
