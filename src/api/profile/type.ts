export type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  sexAtBirth: string;
  bloodGroup: string;
  genotype: string;
  allergies: string;
  currentMedications: string;
  pastConditions: string;
  language: string;
  altLanguage: string;
  smokingStatus: string;
  alcoholUse: string;
};

export const EMPTY_PROFILE: ProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  sexAtBirth: '',
  bloodGroup: '',
  genotype: '',
  allergies: '',
  currentMedications: '',
  pastConditions: '',
  language: '',
  altLanguage: '',
  smokingStatus: '',
  alcoholUse: '',
};

// The patient profile as the server sends it: identity fields, medical fields, and the
// lifestyle and language preferences the settings screens edit.
export type RawPatientProfile = {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  sexAtBirth: string | null;
  bloodGroup: string | null;
  genotype: string | null;
  allergies: string | null;
  currentMeds: string | null;
  medicalConditionsJson: unknown;
  languagePrefsJson: unknown;
  lifestyleJson: unknown;
};

export type RawMeReply = {
  user: { id: string; phone: string; email: string | null };
  patientProfile: RawPatientProfile | null;
};

// The fields the patient may change. Locked identity fields (name, date of birth, sex) are
// rejected with a 403 when they were already saved; the message says what to do instead.
export type UpdateProfileBody = {
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  sexAtBirth?: string;
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  currentMedications?: string;
  medicalConditions?: string[];
  languagePrefs?: { preferredLanguage?: string; alternativeLanguage?: string };
  smokingStatus?: string;
  alcoholUse?: string;
};
