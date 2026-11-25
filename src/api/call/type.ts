export type CallToken = {
  token: string;
  topic: string;
  userName: string;
  seatTakenOver?: boolean;
};

export type TokenBody = {
  // Identifies this device's seat in the call.
  sessionId: string;
  device: string;
  displayName?: string;
  // Set after the device that holds the seat approved this one taking over.
  requestId?: string;
};

export type PresenceEvent = 'joined' | 'left' | 'ping';

export type HandoverRequest = { requestId: string; device: string };

export type PresenceReply = {
  seatMoved?: boolean;
  handoverRequest?: { requestId?: string; device?: string } | null;
};

export type HandoverStatus = { status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'unknown' };

export type HandoverDecision = 'accept' | 'reject';
