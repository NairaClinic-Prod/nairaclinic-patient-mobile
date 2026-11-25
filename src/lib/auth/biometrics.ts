import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricKind = 'face' | 'fingerprint' | 'iris' | null;

export type BiometricSupport = { available: boolean; kind: BiometricKind };

const ERRORS: Record<string, string> = {
  not_enrolled: 'No Face ID or fingerprint is set up on this phone yet.',
  not_available: 'This phone does not support Face ID or fingerprint sign-in.',
  lockout: 'Too many attempts. Try again in a moment, or use your PIN.',
  passcode_not_set: 'Set a phone passcode before turning this on.',
};

const SILENT = new Set(['user_cancel', 'system_cancel', 'app_cancel', 'user_fallback']);

export async function biometricSupport(): Promise<BiometricSupport> {
  try {
    const [hardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const { AuthenticationType } = LocalAuthentication;
    const kind: BiometricKind = types.includes(AuthenticationType.FACIAL_RECOGNITION)
      ? 'face'
      : types.includes(AuthenticationType.FINGERPRINT)
        ? 'fingerprint'
        : types.includes(AuthenticationType.IRIS)
          ? 'iris'
          : null;
    return { available: hardware && enrolled, kind };
  } catch {
    return { available: false, kind: null };
  }
}

export const biometricLabel = (kind: BiometricKind) =>
  kind === 'face' ? 'Face ID' : kind === 'fingerprint' ? 'fingerprint' : 'biometrics';

// Asks for Face ID or fingerprint. A cancel resolves with no error message.
export async function confirmWithBiometrics(
  prompt: string
): Promise<{ ok: true } | { ok: false; error?: string }> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true,
    });
    if (result.success) return { ok: true };
    return {
      ok: false,
      error: SILENT.has(result.error)
        ? undefined
        : (ERRORS[result.error] ?? "That didn't work. Try again."),
    };
  } catch {
    return { ok: false, error: "That didn't work. Try again." };
  }
}
