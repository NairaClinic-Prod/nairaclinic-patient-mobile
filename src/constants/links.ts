export const PRIVACY_URL = 'https://nairaclinic.com/privacy-policy';
export const TERMS_URL = 'https://nairaclinic.com/terms';

// Where the patient website lives. Labs open their result upload link there.
export const PATIENT_APP_URL = (
  process.env.EXPO_PUBLIC_PATIENT_APP_URL || 'https://www.nairaclinic.com'
).replace(/\/+$/, '');
