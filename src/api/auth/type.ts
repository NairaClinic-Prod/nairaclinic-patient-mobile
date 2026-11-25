export type AuthUser = {
  id: string;
  userType: string;
  phone: string | null;
};

export type SessionTokens = {
  token: string;
  refreshToken: string;
  expiresAt: string;
};

export type LoginResponse = SessionTokens & {
  user: AuthUser;
  profileHasPin: boolean;
};

export type RefreshResponse = {
  token: string;
  expiresAt: string;
  refreshToken?: string;
};

export type PinLoginBody = { phone: string; pin: string };

export type PhoneBody = { phone: string };

export type VerifyCodeBody = { phone: string; otp: string };

export type SignUpProfile = {
  firstName: string | null;
  lastName: string | null;
  sexAtBirth: string | null;
  hasPin: boolean;
};

export type SignUpVerifyResponse = SessionTokens & {
  isNewPatient: boolean;
  phoneNumber: string;
  user: AuthUser;
  profile: SignUpProfile;
};

export type ResetVerifyResponse = { token: string; phoneNumber: string };

export type CheckRegistrationResponse = {
  isRegistered: boolean;
  registeredAsOtherType: boolean;
};

export type SignUpDetailsBody = {
  firstName?: string;
  lastName?: string;
  sexAtBirth?: string;
  email?: string;
};

export type ResetPinBody = { phone: string; newPin: string; proofToken: string };

export type ChangePinBody = { currentPin: string; newPin: string };
