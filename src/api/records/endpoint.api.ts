import { request, requestFile } from '../client';
import type {
  CarePlanStore,
  ConsultationsReply,
  MeReply,
  Extraction,
  ExtractedReading,
  LabLink,
  MedicationState,
  NewExternalRecord,
  NewLabLink,
  NewTestOrder,
  ProfileVitalsReply,
  ReferralsReply,
  TestOrder,
  UploadFile,
  VitalRow,
  ExternalRecord,
} from './type';

export const RECORDS_PAGE_SIZE = 20;
// Reading a photo can take a while on the backend.
const SCAN_TIMEOUT_MS = 90_000;
const UPLOAD_TIMEOUT_MS = 60_000;

const carePlanPost = <T>(list: string, body: unknown) =>
  request<T>(`/patient/me/care-plan/${list}`, { body });

function fileForm(file: UploadFile, fields: Record<string, string> = {}) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.append(key, value));
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  return form;
}

export const recordsApi = {
  me: () => request<MeReply>('/patient/me'),

  vitals: () =>
    request<ProfileVitalsReply>('/patient/me').then(
      (reply) => reply.patientProfile?.vitalsJson ?? null
    ),
  saveVitals: (vitals: VitalRow[]) =>
    request<unknown>('/patient/me', { method: 'PATCH', body: { vitals } }),
  consultations: (page: number) =>
    request<ConsultationsReply>(`/consultations?page=${page}&limit=${RECORDS_PAGE_SIZE}`),
  referrals: async () => {
    const all: unknown[] = [];
    for (let page = 1; page <= 50; page++) {
      const reply = await request<ReferralsReply>(`/patient/me/referrals?page=${page}&limit=100`);
      all.push(...reply.referrals);
      if (!reply.meta?.hasMore) break;
    }
    return all;
  },

  carePlan: () =>
    request<CarePlanStore>('/patient/me/care-plan').then((store) => ({
      ...store,
      owned: store.owned ?? {},
      externals: store.externals ?? [],
      results: store.results ?? [],
      orders: store.orders ?? [],
      labLinks: store.labLinks ?? [],
      done: store.done ?? {},
    })),

  setTodo: (id: string, done: boolean) =>
    carePlanPost<Record<string, string>>('todos', { id, done }),

  markMedicines: (ids: string[], state: Exclude<MedicationState, 'available'>) =>
    carePlanPost<unknown>('medicines', { ids, state }),

  saveExternalRecord: (record: NewExternalRecord) =>
    carePlanPost<ExternalRecord>('externals', record),

  createTestOrder: (order: NewTestOrder) => carePlanPost<TestOrder>('orders', order),

  createLabLink: (link: NewLabLink) => carePlanPost<LabLink>('lab-links', link),

  uploadResult: (file: UploadFile, encounterId: string, testIds: string[]) =>
    request<unknown>('/patient/me/care-plan/results', {
      form: fileForm(file, { encounterId, testIds: JSON.stringify(testIds) }),
      timeoutMs: UPLOAD_TIMEOUT_MS,
    }),

  deleteResult: (id: string) =>
    request<unknown>(`/patient/me/care-plan/results/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // A signed prescription or lab request from a NairaClinic consultation, as a PDF.
  consultationPdf: (consultationId: string, kind: 'prescription' | 'lab-investigation') =>
    requestFile(`/documents/consultations/${encodeURIComponent(consultationId)}/${kind}`),

  // The patient's own summary in the NairaClinic layout, without a doctor's signature.
  personalPdf: (title: string, sections: { heading: string; lines: string[] }[]) =>
    requestFile('/documents/personal', {
      body: {
        title: title.slice(0, 120),
        sections: sections
          .filter((section) => section.lines.length)
          .slice(0, 60)
          .map((section) => ({
            heading: section.heading.slice(0, 200),
            lines: section.lines.slice(0, 200).map((line) => line.slice(0, 1000)),
          })),
      },
    }),

  resultFile: (resultId: string) =>
    requestFile(`/patient/me/care-plan/results/${encodeURIComponent(resultId)}/file`),

  // Reads a blood pressure or sugar reading from a photo.
  extractReading: (file: UploadFile) =>
    request<ExtractedReading>('/patient/me/vital-extractions', {
      form: fileForm(file),
      timeoutMs: SCAN_TIMEOUT_MS,
    }),

  // Reads medicines or a test request from a photo of a prescription.
  extractPrescription: (file: UploadFile, kind: 'medication' | 'test') =>
    request<Extraction>('/patient/me/prescription-extractions', {
      form: fileForm(file, { kind }),
      timeoutMs: SCAN_TIMEOUT_MS,
    }),
};
