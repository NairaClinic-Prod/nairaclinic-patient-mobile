import { Platform } from 'react-native';

const sessions = new Map<string, string>();

// This device's seat in a call. It stays the same for the whole time the app is open, so rejoining
// after a drop takes the same seat back instead of asking the patient's other device for approval.
export function seatId(consultationId: string) {
  let id = sessions.get(consultationId);
  if (!id) {
    id = `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessions.set(consultationId, id);
  }
  return id;
}

// A short name for this phone, shown on the other device's prompt.
export const deviceLabel = () =>
  Platform.OS === 'ios' ? 'NairaClinic app on iPhone' : 'NairaClinic app on Android';

// The message sent to everyone in the call when this device takes the seat, so the old one steps out.
export const SEAT_MOVED = 'nc-seat-moved';
