import type { ProfileData, RawMeReply, RawPatientProfile, UpdateProfileBody } from './type';

const text = (value: unknown) => (typeof value === 'string' ? value : '');

const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

function prefs(value: unknown): { preferredLanguage: string; alternativeLanguage: string } {
  const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    preferredLanguage: text(row.preferredLanguage),
    alternativeLanguage: text(row.alternativeLanguage),
  };
}

function lifestyle(value: unknown): { smokingStatus: string; alcoholUse: string } {
  const row = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return { smokingStatus: text(row.smokingStatus), alcoholUse: text(row.alcoholUse) };
}

export function toProfileData(reply: RawMeReply): ProfileData {
  const profile: RawPatientProfile | null = reply.patientProfile;
  const language = prefs(profile?.languagePrefsJson);
  const habits = lifestyle(profile?.lifestyleJson);
  return {
    firstName: text(profile?.firstName),
    lastName: text(profile?.lastName),
    email: text(reply.user.email),
    phone: text(reply.user.phone),
    dob: typeof profile?.dateOfBirth === 'string' ? profile.dateOfBirth.slice(0, 10) : '',
    sexAtBirth: text(profile?.sexAtBirth),
    bloodGroup: text(profile?.bloodGroup),
    genotype: text(profile?.genotype),
    allergies: text(profile?.allergies),
    currentMedications: text(profile?.currentMeds),
    pastConditions: list(profile?.medicalConditionsJson).join(', '),
    language: language.preferredLanguage,
    altLanguage: language.alternativeLanguage,
    smokingStatus: habits.smokingStatus,
    alcoholUse: habits.alcoholUse,
  };
}

const splitConditions = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export function toUpdateBody(draft: ProfileData): UpdateProfileBody {
  return {
    email: draft.email.trim() || undefined,
    firstName: draft.firstName.trim() || undefined,
    lastName: draft.lastName.trim() || undefined,
    dateOfBirth: draft.dob || undefined,
    sexAtBirth: draft.sexAtBirth || undefined,
    bloodGroup: draft.bloodGroup || undefined,
    genotype: draft.genotype || undefined,
    allergies: draft.allergies || undefined,
    currentMedications: draft.currentMedications || undefined,
    medicalConditions: splitConditions(draft.pastConditions),
    languagePrefs: {
      preferredLanguage: draft.language || undefined,
      alternativeLanguage: draft.altLanguage || undefined,
    },
    smokingStatus: draft.smokingStatus || undefined,
    alcoholUse: draft.alcoholUse || undefined,
  };
}
