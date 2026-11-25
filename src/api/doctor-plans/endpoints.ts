const id = (value: string) => encodeURIComponent(value);

// Every doctor-plan endpoint the patient app uses.
export const DOCTOR_PLAN_ENDPOINTS = {
  mine: (doctorUserId?: string) =>
    `/doctor-plans/subscriptions/me${doctorUserId ? `?doctorUserId=${id(doctorUserId)}` : ''}`,
  cancel: (subscriptionId: string) => `/doctor-plans/subscriptions/${id(subscriptionId)}/cancel`,
} as const;
