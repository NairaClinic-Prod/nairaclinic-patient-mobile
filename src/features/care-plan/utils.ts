import type { CarePlanData, CareMedication, CareTest, Encounter } from './types';

const DAY = 86_400_000;

const DATE = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const DATE_TIME = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

export const formatDate = (iso: string) => DATE.format(new Date(iso));
export const formatDateTime = (iso: string) => DATE_TIME.format(new Date(iso));

export function daysRemaining(med: Pick<CareMedication, 'endIso'>) {
  if (!med.endIso) return null;
  return Math.max(0, Math.ceil((new Date(med.endIso).getTime() - Date.now()) / DAY));
}

export const courseEnded = (med: Pick<CareMedication, 'endIso'>) => daysRemaining(med) === 0;

export const isOrderable = (med: CareMedication) =>
  med.state === 'available' && (med.external || Boolean(med.prescriptionId)) && !courseEnded(med);

export function defaultOpenEncounter(encounters: Encounter[]) {
  return (encounters.find((encounter) => encounter.active) ?? encounters[0])?.id ?? null;
}

export const todoKey = {
  med: (med: CareMedication) => `med:${med.id}`,
  test: (test: CareTest) => `test:${test.id}`,
  referral: (id: string) => `ref:${id}`,
};

// A resulted test counts as done by itself, everything else follows the ticks the patient made.
export function isDone(data: CarePlanData) {
  return {
    med: (med: CareMedication) => Boolean(data.done[todoKey.med(med)]),
    test: (test: CareTest) => Boolean(data.done[todoKey.test(test)]) || test.status === 'resulted',
    referral: (id: string) => Boolean(data.done[todoKey.referral(id)]),
  };
}

export function buildTodo(data: CarePlanData, finished: boolean) {
  const done = isDone(data);
  const groups = data.encounters
    .map((encounter) => ({
      encounter,
      meds: encounter.medications.filter((med) => done.med(med) === finished),
      tests: encounter.tests.filter((test) => done.test(test) === finished),
    }))
    .filter((group) => group.meds.length || group.tests.length);
  const referrals = data.referrals.filter((referral) => done.referral(referral.id) === finished);
  const personal = data.todos.filter((todo) => todo.done === finished);
  return {
    groups,
    referrals,
    personal,
    count:
      groups.reduce((sum, group) => sum + group.meds.length + group.tests.length, 0) +
      referrals.length +
      personal.length,
  };
}
