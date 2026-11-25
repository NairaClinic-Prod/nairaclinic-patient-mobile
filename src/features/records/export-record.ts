import { recordsApi, type ConsultationRecord } from '@/api/records';
import { drName } from '@/features/care-plan/build-names';
import type { DocumentSection } from '@/lib/documents';
import { TIMING_LABEL } from './constants';
import { readingsFromVitals } from './vitals-map';

const day = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const long = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Lagos',
});

const when = (value?: string | null) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? day.format(date) : '';
};

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

function ageOf(dateOfBirth: string): string {
  const born = dateOfBirth ? new Date(dateOfBirth) : null;
  if (!born || Number.isNaN(born.getTime())) return '';
  const years = Math.floor((Date.now() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return years >= 0 ? `${years} year${years === 1 ? '' : 's'}` : '';
}

// Past consultations belong on the record; upcoming and live ones don't yet.
const PAST = new Set(['completed', 'ended', 'cancelled', 'missed', 'expired']);
const stageOf = (record: ConsultationRecord) => record.lifecycle ?? record.status ?? '';

// What to say when a consultation has nothing to list, in words the patient understands.
function statusNote(record: ConsultationRecord): string {
  switch (stageOf(record)) {
    case 'cancelled':
      return 'Status: Cancelled. This consultation did not take place.';
    case 'missed':
      return 'Status: Missed. This consultation did not take place at the booked time. You can still reschedule it.';
    case 'expired':
      return 'Status: Missed. This consultation did not take place and can no longer be rescheduled.';
    case 'ended':
      return 'Status: Ended. The call ended before your doctor added any medication or lab tests.';
    default:
      return 'Status: Completed. Your doctor did not prescribe any medication or request any lab tests.';
  }
}

// Medicine names and dose from a doctor's prescription.
function prescriptionItems(itemsJson: unknown): { name: string; detail?: string }[] {
  const source = itemsJson as { items?: unknown; medications?: unknown } | null;
  const list = Array.isArray(itemsJson)
    ? itemsJson
    : Array.isArray(source?.items)
      ? source.items
      : Array.isArray(source?.medications)
        ? source.medications
        : [];
  const asText = (value: unknown) =>
    typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
  return list.flatMap((raw: unknown) => {
    const row = (raw ?? {}) as Record<string, unknown>;
    const name = asText(row.name ?? row.drug ?? row.drugName ?? row.medication ?? row.medicine);
    if (!name) return [];
    const detail = [row.dose ?? row.dosage, row.frequency ?? row.freq, row.duration]
      .map(asText)
      .filter(Boolean)
      .join(' · ');
    return [detail ? { name, detail } : { name }];
  });
}

// One consultation as a single line: date and doctor, diagnosis, then its medication and lab tests.
function visitLine(record: ConsultationRecord): string {
  const medicines = prescriptionItems(record.prescription?.itemsJson).map((item) =>
    [item.name, item.detail].filter(Boolean).join(' · ')
  );
  const tests = record.labTests ?? [];
  return [
    `${when(record.scheduledAtUtc ?? record.createdAt)} · ${drName(record.doctor?.name, 'NairaClinic doctor')}`,
    record.diagnosis ? `Diagnosis: ${record.diagnosis}` : '',
    medicines.length ? `Medication: ${medicines.join('; ')}` : '',
    tests.length ? `Lab Investigation: ${tests.join('; ')}` : '',
    medicines.length || tests.length ? '' : statusNote(record),
  ]
    .filter(Boolean)
    .join(' — ');
}

// Gathers every consultation page, the profile and the patient's own records, in the same order as the
// website's record. The backend lays it out and signs it.
export async function recordSections(): Promise<{ title: string; sections: DocumentSection[] }> {
  const consultations: ConsultationRecord[] = [];
  for (let page = 1; page <= 25; page++) {
    const reply = await recordsApi.consultations(page);
    consultations.push(...reply.consultations);
    if (!reply.meta?.hasMore) break;
  }
  const [vitalsJson, referrals, me, store] = await Promise.all([
    recordsApi.vitals(),
    recordsApi.referrals(),
    recordsApi.me(),
    recordsApi.carePlan(),
  ]);
  const profile = me.patientProfile ?? {};
  const user = me.user ?? {};
  const readings = readingsFromVitals(vitalsJson).sort((a, b) => a.atUtc.localeCompare(b.atUtc));
  const name =
    [text(profile.firstName), text(profile.lastName)].filter(Boolean).join(' ') || 'Patient';
  const conditions = Array.isArray(profile.medicalConditions)
    ? (profile.medicalConditions as unknown[]).map(String)
    : [];

  const sections: DocumentSection[] = [
    {
      heading: 'Patient',
      lines: [
        `Patient Name: ${name}`,
        ageOf(text(profile.dateOfBirth)) && `Age: ${ageOf(text(profile.dateOfBirth))}`,
        text(profile.sexAtBirth) && `Sex: ${text(profile.sexAtBirth)}`,
        when(text(profile.dateOfBirth)) && `Date of birth: ${when(text(profile.dateOfBirth))}`,
        text(user.phone) && `Phone: ${text(user.phone)}`,
        text(profile.bloodGroup) && `Blood group: ${text(profile.bloodGroup)}`,
        text(profile.genotype) && `Genotype: ${text(profile.genotype)}`,
        `Date: ${long.format(new Date())}`,
      ].filter(Boolean) as string[],
    },
    {
      heading: 'Health profile',
      lines: [
        text(profile.allergies) && `Allergies: ${text(profile.allergies)}`,
        conditions.length ? `Conditions: ${conditions.join(', ')}` : '',
        text(profile.currentMedications) &&
          `Current medicines: ${text(profile.currentMedications)}`,
      ].filter(Boolean) as string[],
    },
    {
      heading: 'Blood pressure readings',
      lines: readings
        .filter((reading) => reading.kind === 'bp')
        .slice(-30)
        .map((reading) =>
          reading.kind === 'bp'
            ? `${when(reading.atUtc)} · ${reading.systolic}/${reading.diastolic} mmHg${reading.pulse ? ` · ${reading.pulse} bpm` : ''}`
            : ''
        ),
    },
    {
      heading: 'Blood sugar readings',
      lines: readings
        .filter((reading) => reading.kind === 'sugar')
        .slice(-30)
        .map((reading) =>
          reading.kind === 'sugar'
            ? `${when(reading.atUtc)} · ${reading.sugar} mg/dL · ${TIMING_LABEL[reading.timing]}`
            : ''
        ),
    },
    {
      heading: 'NairaClinic consultations',
      lines: consultations
        .filter((record) => PAST.has(stageOf(record)))
        .map(visitLine)
        .slice(0, 200),
    },
    {
      heading: 'Records you added',
      lines: store.externals.map(
        (record) =>
          `${when(record.date)} · ${record.kind === 'medication' ? 'Prescription' : 'Test request'}${
            record.clinic ? ` from ${record.clinic}` : ''
          }: ${record.items.map((item) => item.name).join(', ')}`
      ),
    },
    {
      heading: 'Referrals',
      lines: referrals.flatMap((entry) => {
        const row = (entry ?? {}) as Record<string, unknown>;
        const title = text(row.specialist) || text(row.hospital);
        return title
          ? [
              `${when(text(row.createdAt))} · ${title}${text(row.reason) ? ` · ${text(row.reason)}` : ''}`,
            ]
          : [];
      }),
    },
  ];
  return { title: `${name} - medical record`, sections };
}
