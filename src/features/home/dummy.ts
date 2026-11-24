import type { HomeData } from './types';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const at = (offset: number) => new Date(Date.now() + offset).toISOString();

export const DUMMY_HOME: HomeData = {
  firstName: 'Amaka',
  unreadCount: 2,
  dashboard: {
    readyNow: [
      {
        id: 'apt-ready',
        status: 'scheduled',
        scheduledAtUtc: at(-5 * MINUTE),
        durationMins: 30,
        doctorName: 'ADEBAYO OKONKWO',
        isSmartRequest: false,
        isInPerson: false,
      },
    ],
    upcoming: [
      {
        id: 'apt-1',
        status: 'scheduled',
        scheduledAtUtc: at(DAY + 2 * 60 * MINUTE),
        durationMins: 30,
        doctorName: 'Ngozi Eze',
        isSmartRequest: false,
        isInPerson: true,
      },
      {
        id: 'apt-2',
        status: 'scheduled',
        scheduledAtUtc: at(3 * DAY),
        durationMins: 20,
        doctorName: 'Ibrahim Musa',
        isSmartRequest: false,
        isInPerson: false,
      },
    ],
    healthTips: [
      'Drink at least eight glasses of water a day.',
      'Take a ten minute walk after your meals.',
      'Keep a regular sleep schedule, even on weekends.',
      'Book a check-up before small problems grow.',
    ],
    careTeam: [
      {
        doctorUserId: 'doc-1',
        name: 'Adebayo Okonkwo',
        specialty: 'General practitioner',
        photoUrl: null,
        bookingSlug: 'adebayo-okonkwo',
        hasOpenSlots: true,
      },
      {
        doctorUserId: 'doc-2',
        name: 'Ngozi Eze',
        specialty: 'Paediatrician',
        photoUrl: null,
        bookingSlug: 'ngozi-eze',
        hasOpenSlots: true,
      },
      {
        doctorUserId: 'doc-3',
        name: 'Ibrahim Musa',
        specialty: null,
        photoUrl: null,
        bookingSlug: 'ibrahim-musa',
        hasOpenSlots: false,
      },
    ],
  },
  referral: {
    code: 'NC-AMAKA7',
    shareUrl: 'https://nairaclinic.com/register?ref=NC-AMAKA7',
  },
};
