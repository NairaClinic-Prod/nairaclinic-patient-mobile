import type { ExternalMedicine, ExternalNext, ExternalTestItem, SourceFile } from '@/api/records';
import { createStore } from '@/lib/store';

export type ExternalKind = 'medication' | 'test';
export type ExternalStep = 'method' | 'upload' | 'review' | 'next' | 'done';

// What the scan said about one row, so a warning stays with the row it belongs to.
export type ScanNote = { warnings: string[]; asWritten: string };

export type MedicineForm = ExternalMedicine & { scan?: ScanNote };
export type TestForm = ExternalTestItem & { scan?: ScanNote };

export type ExternalForm = {
  open: boolean;
  step: ExternalStep;
  kind: ExternalKind;
  method: 'upload' | 'type' | null;
  clinic: string;
  date: string;
  medicines: MedicineForm[];
  tests: TestForm[];
  checked: boolean;
  // Ordering is what most people come here to do, so it starts selected.
  next: ExternalNext;
  declared: boolean;
  previewUri: string | null;
  previewType: string | null;
  extracting: boolean;
  extractError: string | null;
  scanWarnings: string[];
  sourceFiles: SourceFile[];
  savedId: string | null;
  doneText: string;
};

export const blankMedicine = (): MedicineForm => ({
  name: '',
  dose: '',
  frequency: '',
  route: '',
  durationDays: null,
  startDate: '',
});

export const blankTest = (): TestForm => ({ name: '', sample: 'Blood' });

const todayKey = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const fresh = (kind: ExternalKind): ExternalForm => ({
  open: true,
  step: 'method',
  kind,
  method: null,
  clinic: '',
  date: todayKey(),
  medicines: [blankMedicine()],
  tests: [blankTest()],
  checked: false,
  next: 'order',
  declared: false,
  previewUri: null,
  previewType: null,
  extracting: false,
  extractError: null,
  scanWarnings: [],
  sourceFiles: [],
  savedId: null,
  doneText: '',
});

const store = createStore<ExternalForm>({ ...fresh('medication'), open: false });

export const useExternalForm = store.useValue;
export const getExternalForm = store.get;

export const openExternalRecord = (kind: ExternalKind) => store.set(fresh(kind));
export const closeExternalRecord = () => store.set((form) => ({ ...form, open: false }));
export const patchExternal = (patch: Partial<ExternalForm>) =>
  store.set((form) => ({ ...form, ...patch }));
