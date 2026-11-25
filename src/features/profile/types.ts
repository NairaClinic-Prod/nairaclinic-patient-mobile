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

export type ProfileDetailSection = 'personal' | 'health' | 'preferences';
