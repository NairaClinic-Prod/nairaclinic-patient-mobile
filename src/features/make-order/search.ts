import type { CarePlanData } from '@/features/care-plan/types';
import { formatDate } from '@/features/care-plan/utils';
import type { OrderItem, OrderSource } from './types';

export type WantedItem = { name: string; quantity: number };

export function medicationSources(data: CarePlanData): OrderSource[] {
  return (
    data.encounters
      .map((encounter) => {
        const left = encounter.medications.filter((med) => med.state === 'available');
        return {
          id: encounter.id,
          prescriptionId: encounter.prescriptionId ?? null,
          title: encounter.title,
          meta: `${formatDate(encounter.dateIso)} · ${
            encounter.external ? encounter.clinic : encounter.doctor
          } · ${left.length} ${left.length === 1 ? 'medicine' : 'medicines'} still to order`,
          external: encounter.external,
          items: left.map((med): OrderItem => ({
            name: [med.name, med.strength].filter(Boolean).join(' '),
            detail: [med.dose, med.frequency].filter(Boolean).join(' · ') || undefined,
          })),
        };
      })
      // A medicine can only be ordered from a saved prescription or an outside one the patient added.
      .filter((source) => source.items.length > 0 && (source.external || source.prescriptionId))
  );
}

export function labSources(data: CarePlanData): OrderSource[] {
  return data.encounters
    .map((encounter) => {
      const waiting = encounter.tests.filter((test) => test.status === 'awaiting');
      return {
        id: encounter.id,
        prescriptionId: null,
        title: encounter.title,
        meta: `${formatDate(encounter.dateIso)} · ${
          encounter.external ? encounter.clinic : encounter.doctor
        } · ${waiting.length} ${waiting.length === 1 ? 'test' : 'tests'}`,
        external: encounter.external,
        items: waiting.map((test): OrderItem => ({ name: test.name, detail: test.sample })),
      };
    })
    .filter((source) => source.items.length > 0);
}
