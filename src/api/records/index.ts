import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { recordsApi } from './endpoint.api';
import type { CarePlanStore, MedicationState, UploadFile, VitalRow } from './type';

export * from './type';
export { recordsApi, RECORDS_PAGE_SIZE } from './endpoint.api';

export const recordsKeys = {
  all: ['records'] as const,
  vitals: ['records', 'vitals'] as const,
  consultations: ['records', 'consultations'] as const,
  referrals: ['records', 'referrals'] as const,
  carePlan: ['records', 'care-plan'] as const,
};

const MINUTE = 60_000;

export const useVitalsData = () =>
  useQuery({ queryKey: recordsKeys.vitals, queryFn: recordsApi.vitals });

export const useConsultations = (enabled = true) =>
  useInfiniteQuery({
    enabled,
    queryKey: recordsKeys.consultations,
    queryFn: ({ pageParam }) => recordsApi.consultations(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta?.hasMore ? last.meta.page + 1 : undefined),
    select: (data) => data.pages.flatMap((page) => page.consultations),
  });

export const useReferrals = (enabled = true) =>
  useQuery({ queryKey: recordsKeys.referrals, queryFn: recordsApi.referrals, enabled });

export const useCarePlanStore = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: recordsKeys.carePlan,
    queryFn: recordsApi.carePlan,
    staleTime: 5 * MINUTE,
  });

// Shows the new vitals straight away, and puts the old ones back if the backend refuses them.
export async function saveVitals(vitals: VitalRow[]) {
  await queryClient.cancelQueries({ queryKey: recordsKeys.vitals });
  const previous = queryClient.getQueryData(recordsKeys.vitals);
  queryClient.setQueryData(recordsKeys.vitals, vitals);
  try {
    await recordsApi.saveVitals(vitals);
  } catch (error) {
    queryClient.setQueryData(recordsKeys.vitals, previous);
    throw error;
  } finally {
    queryClient.invalidateQueries({ queryKey: recordsKeys.vitals });
  }
}

export const useSaveVitals = () => useMutation({ mutationFn: saveVitals });

async function changeCarePlan<T>(
  edit: (store: CarePlanStore) => CarePlanStore,
  call: () => Promise<T>
) {
  await queryClient.cancelQueries({ queryKey: recordsKeys.carePlan });
  const previous = queryClient.getQueryData<CarePlanStore>(recordsKeys.carePlan);
  if (previous) queryClient.setQueryData(recordsKeys.carePlan, edit(previous));
  try {
    return await call();
  } catch (error) {
    if (previous) queryClient.setQueryData(recordsKeys.carePlan, previous);
    throw error;
  } finally {
    queryClient.invalidateQueries({ queryKey: recordsKeys.carePlan });
  }
}

// Ticks an item off (or back on) in the to-do list.
export const setTodoDone = (id: string, done: boolean) =>
  changeCarePlan(
    (store) => {
      const next = { ...store.done };
      if (done) next[id] = new Date().toISOString();
      else delete next[id];
      return { ...store, done: next };
    },
    () => recordsApi.setTodo(id, done)
  );

// A medicine marked owned stays owned; ordering can't downgrade it.
export const markMedicines = (ids: string[], state: Exclude<MedicationState, 'available'>) =>
  changeCarePlan(
    (store) => ({
      ...store,
      owned: {
        ...store.owned,
        ...Object.fromEntries(
          ids.filter((id) => store.owned[id] !== 'owned').map((id) => [id, state])
        ),
      },
    }),
    () => recordsApi.markMedicines(ids, state)
  );

const refreshCarePlan = () => queryClient.invalidateQueries({ queryKey: recordsKeys.carePlan });

export const useSetTodo = () =>
  useMutation({
    mutationFn: (input: { id: string; done: boolean }) => setTodoDone(input.id, input.done),
  });

export const useMarkMedicines = () =>
  useMutation({
    mutationFn: (input: { ids: string[]; state: Exclude<MedicationState, 'available'> }) =>
      markMedicines(input.ids, input.state),
  });

export const useSaveExternalRecord = () =>
  useMutation({ mutationFn: recordsApi.saveExternalRecord, onSuccess: refreshCarePlan });

export const useCreateTestOrder = () =>
  useMutation({ mutationFn: recordsApi.createTestOrder, onSuccess: refreshCarePlan });

export const useCreateLabLink = () =>
  useMutation({ mutationFn: recordsApi.createLabLink, onSuccess: refreshCarePlan });

export const useDeleteResult = () =>
  useMutation({ mutationFn: recordsApi.deleteResult, onSuccess: refreshCarePlan });

// Uploads one file after another, so a failure says which one stopped.
export const useAttachResults = () =>
  useMutation({
    mutationFn: async (uploads: { file: UploadFile; encounterId: string; testIds: string[] }[]) => {
      for (const upload of uploads) {
        await recordsApi.uploadResult(upload.file, upload.encounterId, upload.testIds);
      }
    },
    onSettled: refreshCarePlan,
  });

export const useExtractReading = () => useMutation({ mutationFn: recordsApi.extractReading });

export const useExtractPrescription = () =>
  useMutation({
    mutationFn: (input: { file: UploadFile; kind: 'medication' | 'test' }) =>
      recordsApi.extractPrescription(input.file, input.kind),
  });
