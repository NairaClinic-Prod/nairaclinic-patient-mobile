export type SugarTiming = 'fasting' | 'before_meal' | 'after_meal' | 'random' | 'bedtime';
export type SugarUnit = 'mg/dL' | 'mmol/L';
export type VitalView = 'bp' | 'sugar';

export type BpReading = {
  id: string;
  kind: 'bp';
  atUtc: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  note?: string;
};

export type SugarReading = {
  id: string;
  kind: 'sugar';
  atUtc: string;
  sugar: number;
  timing: SugarTiming;
  note?: string;
};

export type Reading = BpReading | SugarReading;
