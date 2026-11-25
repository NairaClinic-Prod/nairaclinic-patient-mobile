import { recordsApi, type ConsultationRecord } from '@/api/records';
import { drName } from '@/features/care-plan/build-names';
import type { MedicalRecordBody, RecordChart, RecordGroup, RecordSection } from '@/api/records';
import { COLORS, TIMING_LABEL } from './constants';
import type { Reading } from './types';
import { readingsFromVitals } from './vitals-map';

const day = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const short = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' });

const when = (value?: string | null) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? day.format(date) : '';
};

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

function vitalsCharts(readings: Reading[]): RecordChart[] {
  const bp = readings
    .filter((reading): reading is Extract<Reading, { kind: 'bp' }> => reading.kind === 'bp')
    .slice(-20);
  const sugar = readings
    .filter((reading): reading is Extract<Reading, { kind: 'sugar' }> => reading.kind === 'sugar')
    .slice(-20);
  return [
    {
      title: 'Blood pressure & pulse',
      unit: 'mmHg (pulse in bpm)',
      labels: bp.map((reading) => short.format(new Date(reading.atUtc))),
      series: [
        {
          label: 'Systolic',
          color: COLORS.systolic,
          values: bp.map((reading) => reading.systolic),
        },
        {
          label: 'Diastolic',
          color: COLORS.diastolic,
          values: bp.map((reading) => reading.diastolic),
        },
        {
          label: 'Pulse',
          color: COLORS.pulse,
          values: bp.map((reading) => reading.pulse),
          dashed: true,
        },
      ],
    },
    {
      title: 'Blood sugar',
      unit: 'mg/dL',
      labels: sugar.map((reading) => short.format(new Date(reading.atUtc))),
      series: [
        {
          label: 'Blood sugar',
          color: COLORS.sugar,
          values: sugar.map((reading) => reading.sugar),
        },
      ],
    },
  ];
}

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

// One consultation as "30 Oct 2026 · Dr. Name", then its medication and lab investigation lists.
function visitGroup(record: ConsultationRecord): RecordGroup {
  const medicines = prescriptionItems(record.prescription?.itemsJson).map((item) =>
    [item.name, item.detail].filter(Boolean).join(' · ')
  );
  const tests = record.labTests ?? [];
  return {
    title: `${when(record.scheduledAtUtc ?? record.createdAt)} · ${drName(record.doctor?.name, 'NairaClinic doctor')}`,
    notes: [
      ...(record.diagnosis ? [`Diagnosis: ${record.diagnosis}`] : []),
      ...(medicines.length || tests.length ? [] : [statusNote(record)]),
    ],
    lists: [
      { label: 'Medication', items: medicines },
      { label: 'Lab Investigation', items: tests },
    ],
  };
}

// Gathers every consultation page, the vitals and the patient's own records, in the same order as the
// website's download. The backend adds the patient's details and draws the whole document.
export async function recordPayload(): Promise<MedicalRecordBody> {
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
  const readings = readingsFromVitals(vitalsJson).sort((a, b) => a.atUtc.localeCompare(b.atUtc));
  const conditions = Array.isArray(profile.medicalConditions)
    ? (profile.medicalConditions as unknown[]).map(String)
    : [];

  const sections: RecordSection[] = [
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
      groups: consultations.filter((record) => PAST.has(stageOf(record))).map(visitGroup),
      empty: 'No consultations yet.',
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
  return { charts: vitalsCharts(readings), sections };
}
