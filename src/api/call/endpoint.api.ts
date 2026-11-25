import { request } from '../client';
import type {
  CallToken,
  HandoverDecision,
  HandoverStatus,
  PresenceEvent,
  PresenceReply,
  TokenBody,
} from './type';

const id = (value: string) => encodeURIComponent(value);

export const callApi = {
  // A short-lived Zoom token for this consultation. Throws 409 SEAT_APPROVAL_NEEDED when another device holds the seat.
  token: (consultationId: string, body: TokenBody) =>
    request<CallToken>(`/consultations/${id(consultationId)}/video/zoom-token`, {
      body,
      timeoutMs: 25_000,
    }),

  // Keeps this device's seat alive. The reply says if the seat moved or another device is asking for it.
  presence: (consultationId: string, event: PresenceEvent, sessionId: string) =>
    request<PresenceReply>(`/consultations/${id(consultationId)}/presence`, {
      body: { role: 'patient', event, sessionId },
    }),

  handoverPending: (consultationId: string, sessionId: string) =>
    request<{ request?: { requestId?: string; device?: string } | null }>(
      `/consultations/${id(consultationId)}/seat-handover-pending?sessionId=${id(sessionId)}`
    ),

  handoverStatus: (consultationId: string, requestId: string) =>
    request<HandoverStatus>(`/consultations/${id(consultationId)}/seat-handover/${id(requestId)}`),

  answerHandover: (
    consultationId: string,
    requestId: string,
    decision: HandoverDecision,
    sessionId: string
  ) =>
    request<unknown>(`/consultations/${id(consultationId)}/seat-handover/${id(requestId)}`, {
      body: { decision, sessionId },
    }),

  rate: (consultationId: string, body: { rating: number; review?: string }) =>
    request<unknown>(`/consultations/${id(consultationId)}/rating`, { body }),
};
