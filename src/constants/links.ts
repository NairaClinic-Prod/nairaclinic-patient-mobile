export const PRIVACY_URL = 'https://nairaclinic.com/privacy-policy';
export const TERMS_URL = 'https://nairaclinic.com/terms';

// Where the patient website lives for this environment. Labs open their result upload link there and
// Paystack returns here after a payment.
export { SITE_URL as PATIENT_APP_URL } from '@/lib/env';

// The deep link back into this app. It must match the "Back to the app" link on the website's
// Paystack callback page and the scheme in app.json.
export const APP_LINK = 'nairaclinic-patient-mobile://';
