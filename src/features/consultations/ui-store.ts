import { createStore } from '@/lib/store';

type State = { open: boolean; id: string | null };

const store = createStore<State>({ open: false, id: null });

export const useConsultationSheet = store.use;
export const openConsultation = (id: string) => store.set({ open: true, id });
export const closeConsultation = () => store.set((state) => ({ ...state, open: false }));
