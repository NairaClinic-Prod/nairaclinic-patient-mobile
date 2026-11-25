import { send } from '@/api/http';
import { replaceTokens, signIn, signOut } from '@/lib/auth/session';
import { splitName } from '@/lib/validation';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../client';
import { authApi } from './endpoint.api';
import type { SessionTokens, SignUpVerifyResponse } from './type';

export * from './type';
export { authApi } from './endpoint.api';

// Ends a session the flow doesn't keep, such as the one a PIN reset hands back.
const discard = (session: SessionTokens) =>
  send('/auth/logout', {
    bearer: session.token,
    body: { refreshToken: session.refreshToken },
  }).catch(() => undefined);

export function usePinLogin() {
  return useMutation({
    mutationFn: async (input: { phone: string; pin: string; remember: boolean }) => {
      const session = await authApi.pinLogin({ phone: input.phone, pin: input.pin });
      if (session.user.userType !== 'patient') {
        await discard(session);
        throw new ApiError('This number belongs to a different kind of account.', 403);
      }
      await signIn(session, { remember: input.remember });
      return session;
    },
  });
}

export function useSendSignUpCode() {
  return useMutation({ mutationFn: authApi.sendSignUpCode });
}

export type SignUpDraft = SignUpVerifyResponse;

// Checks the code. The account it returns is only kept once details and a PIN are saved.
export function useVerifySignUpCode() {
  return useMutation({
    mutationFn: async (input: { phone: string; otp: string }) => {
      const draft = await authApi.verifySignUpCode(input);
      if (draft.profile?.hasPin) {
        await discard(draft);
        throw new ApiError(
          'You already have an account with this number. Log in with your PIN.',
          409,
          'ACCOUNT_EXISTS'
        );
      }
      return draft;
    },
  });
}

export function useCompleteSignUp() {
  return useMutation({
    mutationFn: async (input: {
      draft: SignUpDraft;
      name: string;
      sex: string;
      email: string;
      referral: string;
      pin: string;
    }) => {
      const { draft } = input;
      const referral = input.referral.trim();
      if (referral) {
        await authApi.applyReferral(draft.token, referral).catch((error) => {
          throw new ApiError(
            error instanceof ApiError ? error.message : "This referral code isn't valid.",
            400,
            'REFERRAL'
          );
        });
      }

      const { firstName, lastName } = splitName(input.name);
      const locked = draft.profile ?? null;
      await authApi.saveSignUpDetails(draft.token, {
        ...(locked?.firstName ? {} : { firstName, ...(lastName ? { lastName } : {}) }),
        ...(locked?.sexAtBirth ? {} : { sexAtBirth: input.sex }),
        ...(input.email.trim() ? { email: input.email.trim() } : {}),
      });
      await authApi.setPin(draft.token, input.pin);
      await signIn(draft, { remember: true });
    },
  });
}

export function useSendResetCode() {
  return useMutation({
    mutationFn: async (input: { phone: string }) => {
      const account = await authApi.checkRegistration(input);
      if (account.registeredAsOtherType) {
        throw new ApiError('This number belongs to a different kind of account.', 403);
      }
      if (!account.isRegistered) {
        throw new ApiError('There is no account with this number. Sign up instead.', 404);
      }
      await authApi.sendResetCode(input);
    },
  });
}

export function useVerifyResetCode() {
  return useMutation({ mutationFn: authApi.verifyResetCode });
}

// Saves the new PIN. The session the backend returns is ended so the patient logs in with the new PIN.
export function useResetPin() {
  return useMutation({
    mutationFn: async (input: { phone: string; newPin: string; proofToken: string }) => {
      const session = await authApi.resetPin(input);
      await discard(session);
    },
  });
}

export function useChangePin() {
  return useMutation({
    mutationFn: async (input: { currentPin: string; newPin: string }) => {
      const next = await authApi.changePin(input);
      await replaceTokens(next);
    },
  });
}

export function useSignOut() {
  return useMutation({ mutationFn: signOut });
}
