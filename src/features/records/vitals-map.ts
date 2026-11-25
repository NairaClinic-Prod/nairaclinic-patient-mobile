import type { VitalHistoryEntry, VitalRow } from '@/api/records';
import { TIMING_LABEL } from './constants';
import type { BpReading, Reading, SugarReading, SugarTiming } from './types';
import { fromUnit } from './utils';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// The backend keeps vitals as a list, or sometimes as an object keyed by name.
const rows = (vitalsJson: unknown): VitalRow[] =>
  Array.isArray(vitalsJson)
    ? (vitalsJson.filter(isObject) as VitalRow[])
    : isObject(vitalsJson)
      ? Object.entries(vitalsJson as Record<string, VitalRow>).map(([id, row]) => ({ id, ...row }))
      : [];

const historyOf = (row?: VitalRow): VitalHistoryEntry[] =>
  (Array.isArray(row?.history) ? row.history : []).filter(
    (entry): entry is VitalHistoryEntry => isObject(entry) && typeof entry.atUtc === 'string'
  );

const find = (list: VitalRow[], ...keys: string[]) =>
  list.find((row) =>
    keys.some((key) =>
      String(row.id ?? row.name ?? '')
        .toLowerCase()
        .includes(key)
    )
  );

const stableId = (prefix: string, atUtc: string) => `${prefix}-${atUtc}`;

const BP = ['blood_pressure', 'blood pressure'];
const PULSE = ['heart_rate', 'pulse', 'heart rate'];
const SUGAR = ['blood_sugar', 'glucose', 'blood sugar'];

// Turns what the backend saved into the readings the Records screen lists and charts.
export function readingsFromVitals(vitalsJson: unknown): Reading[] {
  const list = rows(vitalsJson);
  const pressure = find(list, ...BP);
  const pulse = find(list, ...PULSE);
  const sugar = find(list, ...SUGAR);
  const pulseAt = new Map(historyOf(pulse).map((entry) => [entry.atUtc, Number(entry.value)]));
  const out: Reading[] = [];

  for (const entry of historyOf(pressure)) {
    const [systolic, diastolic] = String(entry.value ?? '')
      .split(/\s*\/\s*/)
      .map(Number);
    if (!(systolic > 0 && diastolic > 0)) continue;
    const beat = pulseAt.get(entry.atUtc);
    out.push({
      id: entry.id ?? stableId('bp', entry.atUtc),
      kind: 'bp',
      atUtc: entry.atUtc,
      systolic,
      diastolic,
      pulse: beat && beat > 0 ? beat : null,
      note: entry.note,
      source: entry.source,
    });
  }

  const mmol = (sugar?.unit ?? 'mg/dL').toLowerCase().includes('mmol');
  for (const entry of historyOf(sugar)) {
    const value = Number(entry.value);
    if (!(value > 0)) continue;
    out.push({
      id: entry.id ?? stableId('sugar', entry.atUtc),
      kind: 'sugar',
      atUtc: entry.atUtc,
      sugar: fromUnit(value, mmol ? 'mmol/L' : 'mg/dL'),
      timing:
        (entry.timing as SugarTiming) in TIMING_LABEL ? (entry.timing as SugarTiming) : 'random',
      note: entry.note,
      source: entry.source,
    });
  }
  return out.sort((a, b) => b.atUtc.localeCompare(a.atUtc));
}

// Writes the readings back into the saved vitals, leaving every other vital (weight, temperature…) alone.
export function vitalsFromReadings(vitalsJson: unknown, readings: Reading[]): VitalRow[] {
  const original = rows(vitalsJson);
  const originalBpAt = new Set(historyOf(find(original, ...BP)).map((entry) => entry.atUtc));
  // Pulse readings that were never part of a blood pressure reading stay as they were.
  const pulseOnly = historyOf(find(original, ...PULSE)).filter(
    (entry) => !originalBpAt.has(entry.atUtc)
  );
  const others = original.filter(
    (row) =>
      !/blood_pressure|blood pressure|heart_rate|heart rate|pulse|blood_sugar|blood sugar|glucose/i.test(
        `${row.id ?? ''} ${row.name ?? ''}`
      )
  );

  const asc = [...readings].sort((a, b) => a.atUtc.localeCompare(b.atUtc));
  const bp = asc.filter((reading): reading is BpReading => reading.kind === 'bp');
  const sugar = asc.filter((reading): reading is SugarReading => reading.kind === 'sugar');
  const extra = (reading: Reading) => ({
    id: reading.id,
    ...(reading.note ? { note: reading.note } : {}),
    ...(reading.source ? { source: reading.source } : {}),
  });
  const vital = (
    id: string,
    name: string,
    unit: string,
    history: VitalHistoryEntry[]
  ): VitalRow => ({
    id,
    name,
    unit,
    value: history.at(-1)?.value ?? '—',
    history,
  });

  const out: VitalRow[] = others.map((row) => ({
    name: row.name ?? row.id ?? 'Vital',
    value: '—',
    ...row,
  }));
  if (bp.length) {
    out.push(
      vital(
        'blood_pressure',
        'Blood pressure',
        'mmHg',
        bp.map((reading) => ({
          atUtc: reading.atUtc,
          value: `${reading.systolic}/${reading.diastolic}`,
          ...extra(reading),
        }))
      )
    );
  }
  const beats = [
    ...pulseOnly,
    ...bp
      .filter((reading) => reading.pulse)
      .map((reading) => ({
        atUtc: reading.atUtc,
        value: String(reading.pulse),
        id: `${reading.id}-pulse`,
      })),
  ].sort((a, b) => a.atUtc.localeCompare(b.atUtc));
  if (beats.length) out.push(vital('heart_rate', 'Heart rate', 'bpm', beats));
  if (sugar.length) {
    out.push(
      vital(
        'blood_sugar',
        'Blood sugar',
        'mg/dL',
        sugar.map((reading) => ({
          atUtc: reading.atUtc,
          value: String(reading.sugar),
          timing: reading.timing,
          ...extra(reading),
        }))
      )
    );
  }
  return out;
}
