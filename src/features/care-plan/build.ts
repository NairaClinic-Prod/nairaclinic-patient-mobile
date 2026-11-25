import type { ConsultationRecord, ExternalRecord, MedicationState } from '@/api/records';
import { drName } from '@/features/home/utils';
import type { CareMedication, CareReferral, CareTest, Encounter } from './types';
import { courseEnded } from './utils';

const DAY = 86_400_000;
const UNKNOWN_SAMPLE = 'Not specified';
const ACTIVE_WINDOW_DAYS = 30;

const str = (value: unknown) =>
  typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
const pick = (row: Record<string, unknown>, keys: string[]) =>
  keys.map((key) => str(row[key])).find(Boolean) ?? '';

const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * DAY).toISOString();

// The doctor's prescription lines. The backend has used several field names over time.
function prescriptionLines(itemsJson: unknown): Record<string, unknown>[] {
  const source = itemsJson as { items?: unknown; medications?: unknown } | null;
  const list = Array.isArray(itemsJson)
    ? itemsJson
    : Array.isArray(source?.items)
      ? source.items
      : Array.isArray(source?.medications)
        ? source.medications
        : [];
  return list.filter(
    (row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object'
  );
}

const stateOf = (owned: Record<string, MedicationState>, id: string): MedicationState =>
  owned[id] ?? 'available';

// Adds a unit to bare numbers: "2" becomes "2 times daily".
function humanize(value: string, unit: string) {
  if (!/^\d+$/.test(value)) return value;
  const count = Number(value);
  return unit === 'daily'
    ? `${count} ${count === 1 ? 'time' : 'times'} daily`
    : `${count} ${unit}${count === 1 ? '' : 's'}`;
}

function medicationFromLine(
  line: Record<string, unknown>,
  encounterId: string,
  prescriptionId: string | null,
  index: number,
  startIso: string,
  state: MedicationState,
  external = false
): CareMedication {
  const duration = Number.parseInt(pick(line, ['durationDays', 'duration', 'days']), 10);
  const durationDays = Number.isFinite(duration) && duration > 0 ? duration : null;
  const strength = pick(line, ['strength']);
  const form = pick(line, ['form']);
  return {
    id: `${prescriptionId ?? encounterId}:${index}`,
    encounterId,
    prescriptionId,
    rx: index + 1,
    name: pick(line, ['name', 'drug', 'drugName', 'medication', 'medicine']) || 'Medicine',
    strength: strength || form,
    dose: humanize(pick(line, ['dose', 'dosage']), `${form || 'unit'}`) || 'As prescribed',
    frequency:
      humanize(pick(line, ['frequency', 'how_often', 'howOften']), 'daily') || 'As prescribed',
    route: pick(line, ['route']) || 'As prescribed',
    durationDays,
    startIso,
    endIso: durationDays ? addDays(startIso, durationDays) : null,
    instruction: pick(line, ['instructions', 'instruction', 'directions', 'note', 'notes']),
    external,
    state,
  };
}

// "ongoing_check_up" becomes "Ongoing check up".
function readableLabel(text: string) {
  if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i.test(text)) return text;
  const spaced = text.replace(/[_-]+/g, ' ').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function consultationTitle(consultation: ConsultationRecord) {
  const reason = consultation.reason?.replace(/^\s*\[[^\]]*\]\s*/, '').trim();
  return readableLabel(consultation.diagnosis || reason || 'Consultation');
}

const encounterRef = (id: string) => `ENC-${id.slice(-6).toUpperCase()}`;

function isActive(medications: CareMedication[], dateIso: string) {
  if (!medications.length) return false;
  return medications.some((med) =>
    med.endIso
      ? !courseEnded(med)
      : Date.now() - new Date(dateIso).getTime() < ACTIVE_WINDOW_DAYS * DAY
  );
}

// One entry per consultation that has medicines or tests, plus the records the patient added from other clinics.
export function buildEncounters(
  consultations: ConsultationRecord[],
  owned: Record<string, MedicationState>,
  resulted: Set<string>,
  externals: ExternalRecord[]
): Encounter[] {
  const fromConsultations = consultations.flatMap((consultation): Encounter[] => {
    const own = consultation.prescription
      ? prescriptionLines(consultation.prescription.itemsJson)
      : [];
    const lines = own.length ? own : prescriptionLines(consultation.doctorMedications);
    const tests = consultation.labTests ?? [];
    if (!lines.length && !tests.length) return [];

    const dateIso =
      consultation.scheduledAtUtc ?? consultation.createdAt ?? new Date().toISOString();
    const prescriptionId = consultation.prescription?.id ?? null;
    const medications = lines.map((line, index) => {
      const med = medicationFromLine(
        line,
        consultation.id,
        prescriptionId,
        index,
        dateIso,
        'available'
      );
      return { ...med, state: stateOf(owned, med.id) };
    });
    const careTests: CareTest[] = tests.map((name, index) => ({
      id: `${consultation.id}:t${index}`,
      encounterId: consultation.id,
      n: index + 1,
      name,
      sample: UNKNOWN_SAMPLE,
      requestedIso: dateIso,
      note: '',
      external: false,
      status: resulted.has(`${consultation.id}:t${index}`) ? 'resulted' : 'awaiting',
    }));
    return [
      {
        id: consultation.id,
        ref: encounterRef(consultation.id),
        title: consultationTitle(consultation),
        dateIso,
        doctor: consultation.doctor?.name ? drName(consultation.doctor.name) : 'Your doctor',
        prescriptionId,
        external: false,
        clinic: '',
        active: isActive(medications, dateIso),
        medications,
        tests: careTests,
      },
    ];
  });

  const fromExternal = externals.map((record): Encounter => {
    const dateIso = new Date(record.date).toISOString();
    const base = {
      id: record.id,
      ref: encounterRef(record.id),
      title: 'External prescription',
      dateIso,
      doctor: record.clinic || 'External prescriber',
      prescriptionId: null,
      external: true,
      clinic: record.clinic,
    };
    if (record.kind === 'medication') {
      const medications = record.items.map((item, index) => {
        const start = new Date(item.startDate || record.date).toISOString();
        const med = medicationFromLine(
          {
            name: item.name,
            dose: item.dose,
            frequency: item.frequency,
            route: item.route,
            durationDays: item.durationDays,
          },
          record.id,
          null,
          index,
          start,
          'available',
          true
        );
        return {
          ...med,
          state: record.next === 'have' ? ('owned' as const) : stateOf(owned, med.id),
        };
      });
      return { ...base, active: isActive(medications, dateIso), medications, tests: [] };
    }
    const tests: CareTest[] = record.items.map((item, index) => ({
      id: `${record.id}:t${index}`,
      encounterId: record.id,
      n: index + 1,
      name: item.name,
      sample: item.sample,
      requestedIso: dateIso,
      note: '',
      external: true,
      status: resulted.has(`${record.id}:t${index}`) ? 'resulted' : 'awaiting',
    }));
    return { ...base, title: 'External test request', active: true, medications: [], tests };
  });

  return [...fromConsultations, ...fromExternal].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
}

export function parseReferrals(raw: unknown[]): CareReferral[] {
  return raw.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const row = entry as Record<string, unknown>;
    const hospital = pick(row, ['hospital']);
    return [
      {
        id: str(row.id) || `ref_${index}`,
        title: pick(row, ['specialist']) || `Referral ${index + 1}`,
        hospital,
        reason: pick(row, ['reason']),
        status: pick(row, ['status']) || 'Pending',
        dateIso: pick(row, ['createdAt']) || new Date().toISOString(),
        referredBy: pick(row, ['referredBy']),
        onPlatform: !hospital || /nairaclinic/i.test(hospital),
      },
    ];
  });
}
