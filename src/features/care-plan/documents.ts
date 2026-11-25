import { recordsApi } from '@/api/records';
import { openReply, runDocument, type DocumentSection } from '@/lib/documents';
import { recordSections } from '@/features/records/export-record';
import type { CareMedication, CareReferral, CareTest, Encounter } from './types';
import { formatDate, plural } from './utils';

export const pdfKeys = {
  prescription: (encounterId: string) => `prescription:${encounterId}`,
  tests: (encounterId: string) => `tests:${encounterId}`,
  referral: (referralId: string) => `referral:${referralId}`,
  summary: 'care-plan-summary',
  records: 'all-records',
};

const medLine = (med: CareMedication) =>
  `${med.name} ${med.strength} — ${med.dose}, ${med.frequency}, ${med.route}${
    med.durationDays ? `, ${plural(med.durationDays, 'day')}` : ''
  }${med.instruction ? ` (${med.instruction})` : ''}`;

const personal = (key: string, title: string, sections: DocumentSection[]) =>
  runDocument(key, async () => openReply(await recordsApi.personalPdf(title, sections), title));

const ADDED_BY_PATIENT = 'Added by the patient. Not issued or verified by NairaClinic.';

// A consultation's prescription comes signed by the doctor from the backend. One the patient added from
// another clinic has no consultation, so the backend lays out the patient's own copy.
export function downloadPrescription(encounter: Encounter) {
  const key = pdfKeys.prescription(encounter.id);
  if (encounter.external) {
    return personal(key, `Prescription — ${encounter.clinic || 'External'}`, [
      { heading: 'Note', lines: [ADDED_BY_PATIENT] },
      {
        heading: 'Details',
        lines: [`Date: ${formatDate(encounter.dateIso)}`, `Prescribed by: ${encounter.doctor}`],
      },
      { heading: 'Medications', lines: encounter.medications.map(medLine) },
    ]);
  }
  return runDocument(key, async () =>
    openReply(
      await recordsApi.consultationPdf(encounter.id, 'prescription'),
      `Prescription ${encounter.ref}`
    )
  );
}

export function downloadTestForm(encounter: Encounter, tests: CareTest[] = encounter.tests) {
  const key = pdfKeys.tests(encounter.id);
  if (encounter.external) {
    return personal(key, `Test request — ${encounter.clinic || 'External'}`, [
      { heading: 'Note', lines: [ADDED_BY_PATIENT] },
      {
        heading: 'Details',
        lines: [`Date: ${formatDate(encounter.dateIso)}`, `Requested by: ${encounter.doctor}`],
      },
      { heading: 'Tests', lines: tests.map((test) => `${test.name} (${test.sample})`) },
    ]);
  }
  return runDocument(key, async () =>
    openReply(
      await recordsApi.consultationPdf(encounter.id, 'lab-investigation'),
      `Test request ${encounter.ref}`
    )
  );
}

function summarySections(encounters: Encounter[], referrals: CareReferral[]): DocumentSection[] {
  return [
    ...encounters.map((encounter) => ({
      heading: `Consultation #${encounter.ref} — ${encounter.title} (${formatDate(encounter.dateIso)})`,
      lines: [
        ...encounter.medications.map(medLine),
        ...encounter.tests.map(
          (test) =>
            `Test: ${test.name} (${test.status === 'resulted' ? 'result available' : 'awaiting result'})`
        ),
      ],
    })),
    {
      heading: 'Referrals',
      lines: referrals.map(
        (referral) =>
          `${referral.title}${referral.hospital ? ` — ${referral.hospital}` : ''} (${referral.status ?? 'Pending'})`
      ),
    },
  ];
}

export const downloadSummary = (encounters: Encounter[], referrals: CareReferral[]) =>
  personal(pdfKeys.summary, 'Care plan summary', summarySections(encounters, referrals));

export function downloadReferralLetter(referral: CareReferral) {
  return personal(pdfKeys.referral(referral.id), `Referral — ${referral.title}`, [
    {
      heading: 'Referral',
      lines: [
        `Date: ${formatDate(referral.dateIso)}`,
        `Referred to: ${referral.hospital || referral.title}`,
        ...(referral.referredBy ? [`Referred by: ${referral.referredBy}`] : []),
        `Status: ${referral.status ?? 'Pending'}`,
      ],
    },
    { heading: 'Reason', lines: [referral.reason || 'See your consultation notes.'] },
  ]);
}

// The whole record as one document from the backend's personal document endpoint.
export function downloadAllRecords() {
  return runDocument(pdfKeys.records, async () => {
    const { title, sections } = await recordSections();
    await openReply(await recordsApi.personalPdf(title, sections), title);
  });
}
