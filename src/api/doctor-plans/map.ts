import type { DoctorPlan, RawDoctorSubscription, RawIncludedVisit } from './type';

const visitLabel = (row: RawIncludedVisit) =>
  `${row.type === 'video' ? 'Video consultation' : 'In-person visit'} · ${row.durationMins} min`;

export function toDoctorPlan(raw: RawDoctorSubscription): DoctorPlan {
  return {
    id: raw.id,
    doctor: raw.doctor.name ? `Dr. ${raw.doctor.name}` : 'Your doctor',
    doctorSlug: raw.doctor.bookingSlug,
    name: raw.terms.name,
    status: raw.status,
    periodEnd: raw.periodEndUtc,
    nextChargeKobo: raw.nextChargeKobo,
    card: raw.card ? `${raw.card.brand ?? 'Card'} •••• ${raw.card.last4}` : null,
    remaining: raw.remaining.map((row) => ({
      label: visitLabel(row),
      remaining: row.remaining,
      count: row.count,
    })),
  };
}
