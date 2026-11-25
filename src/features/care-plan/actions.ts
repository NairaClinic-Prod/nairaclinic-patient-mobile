import { router } from 'expo-router';
import { downloadPrescription, downloadReferralLetter, downloadTestForm } from './documents';
import type { EncounterHandlers } from './components/encounter-accordion';
import { openAttachedResults, openLabLink, openUploadResults } from './ui-store';
import type { Encounter } from './types';

// What the care plan's buttons do. Rows fall back to these when a screen passes no handlers of its own.
export const carePlanHandlers: EncounterHandlers = {
  onPrescription: (encounter: Encounter) => downloadPrescription(encounter),
  onTestForm: (encounter: Encounter) => downloadTestForm(encounter),
  onUploadResults: (encounter: Encounter) => openUploadResults(encounter.id),
  onUpload: (test) => openUploadResults(test.encounterId, test.id),
  onViewResult: (test) => openAttachedResults(test.encounterId),
  onDeleteResult: (test) => openAttachedResults(test.encounterId),
  onLabLink: (encounter: Encounter) => openLabLink(encounter.id),
};

export const openReferralLetter = downloadReferralLetter;
export const findSpecialist = () => router.push('/book/find');
