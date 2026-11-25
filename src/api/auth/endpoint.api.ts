import { request } from '../client';
import type {
  ChangePinBody,
  CheckRegistrationResponse,
  LoginResponse,
  PhoneBody,
  PinLoginBody,
  ResetPinBody,
  ResetVerifyResponse,
  SessionTokens,
  SignUpDetailsBody,
  SignUpVerifyResponse,
  VerifyCodeBody,
} from './type';

const timezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

export const authApi = {
  pinLogin: (body: PinLoginBody) =>
    request<LoginResponse>('/auth/pin/login', {
      auth: 'none',
      body: { userType: 'patient', ...body },
    }),

  checkRegistration: ({ phone }: PhoneBody) =>
    request<CheckRegistrationResponse>('/auth/check-registration', {
      auth: 'none',
      body: { phone, userType: 'patient' },
    }),

  sendSignUpCode: ({ phone }: PhoneBody) =>
    request<unknown>('/patient/whatsapp/send-otp', { auth: 'none', body: { phone } }),

  // Creates the patient account if it doesn't exist yet and returns a session for it.
  verifySignUpCode: ({ phone, otp }: VerifyCodeBody) =>
    request<SignUpVerifyResponse>('/patient/whatsapp/verify-otp', {
      auth: 'none',
      body: { phone, otp, timezone: timezone() },
    }),

  applyReferral: (token: string, referralCode: string) =>
    request<{ applied: boolean }>('/patient/me/referral', {
      auth: { bearer: token },
      body: { referralCode },
    }),

  saveSignUpDetails: (token: string, body: SignUpDetailsBody) =>
    request<unknown>('/patient/me', { method: 'PATCH', auth: { bearer: token }, body }),

  setPin: (token: string, pin: string) =>
    request<unknown>('/patient/me/pin', {
      method: 'PATCH',
      auth: { bearer: token },
      body: { pin },
    }),

  sendResetCode: ({ phone }: PhoneBody) =>
    request<unknown>('/auth/whatsapp/send-otp', { auth: 'none', body: { phone } }),

  // Returns a short-lived proof that this phone was verified.
  verifyResetCode: (body: VerifyCodeBody) =>
    request<ResetVerifyResponse>('/auth/whatsapp/verify-otp', { auth: 'none', body }),

  resetPin: ({ phone, newPin, proofToken }: ResetPinBody) =>
    request<LoginResponse>('/auth/pin/reset', {
      auth: { bearer: proofToken },
      body: { userType: 'patient', phone, newPin },
    }),

  changePin: (body: ChangePinBody) =>
    request<SessionTokens>('/auth/pin/change', { method: 'PATCH', body }),
};
