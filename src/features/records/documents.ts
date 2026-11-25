import type { DocumentSection } from '@/lib/documents';
import { TIMING_LABEL } from './constants';
import type { Reading } from './types';
import { stampLabel } from './utils';

// The readings as lines for the "Download" document, newest first.
export function vitalsSections(readings: Reading[]): DocumentSection[] {
  const bp = readings.flatMap((reading) =>
    reading.kind === 'bp'
      ? [
          `${stampLabel(reading.atUtc)} — ${reading.systolic}/${reading.diastolic} mmHg${
            reading.pulse ? `, pulse ${reading.pulse} bpm` : ''
          }${reading.note ? ` (${reading.note})` : ''}`,
        ]
      : []
  );
  const sugar = readings.flatMap((reading) =>
    reading.kind === 'sugar'
      ? [
          `${stampLabel(reading.atUtc)} — ${reading.sugar} mg/dL, ${TIMING_LABEL[reading.timing]}${
            reading.note ? ` (${reading.note})` : ''
          }`,
        ]
      : []
  );
  return [
    { heading: 'Blood pressure & pulse', lines: bp },
    { heading: 'Blood sugar', lines: sugar },
  ];
}
