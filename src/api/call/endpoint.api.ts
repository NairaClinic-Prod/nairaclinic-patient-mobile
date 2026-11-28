import { request } from '../client';
import type {
  CallToken,
  ChatMessage,
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

  // The messages already sent in this consultation, oldest first.
  chatMessages: (consultationId: string) =>
    request<ChatMessage[]>(`/consultations/${id(consultationId)}/chat/messages`),

  // Sends a chat message over plain HTTP, for when the live connection is down.
  sendChat: (consultationId: string, text: string) =>
    request<ChatMessage>(`/consultations/${id(consultationId)}/chat/messages`, { body: { text } }),

  rate: (consultationId: string, body: { rating: number; review?: string }) =>
    request<unknown>(`/consultations/${id(consultationId)}/rating`, { body }),
};
