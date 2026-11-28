export type DashboardAppointment = {
  id: string;
  type?: string;
  status: string;
  scheduledAtUtc: string | null;
  durationMins: number | null;
  doctorUserId?: string;
  doctorName: string;
  isSmartRequest: boolean;
  isInPerson: boolean;
  category?: 'general' | 'specialist' | null;
  specialty?: string | null;
  channelName?: string | null;
  reason?: string | null;
  rescheduleReason?: string | null;
};

export type CareTeamMember = {
  doctorUserId: string;
  name: string;
  specialty: string | null;
  photoUrl: string | null;
  bookingSlug: string | null;
  addedByPatient: boolean;
  kind?: 'nairaclinic';
};

export type DashboardResponse = {
  nowUtc: string;
  nextAppointment: DashboardAppointment | null;
  readyNow: DashboardAppointment[];
  upcoming: DashboardAppointment[];
  healthTips: string[];
  careTeam: CareTeamMember[];
  metrics?: { walletBalanceTokens?: number };
};

export type HomeProfileResponse = {
  user: { id: string; phone: string | null; email: string | null };
  patientProfile: {
    firstName: string | null;
    lastName: string | null;
    // A short-lived link to the patient's picture, when they have set one.
    profilePhotoUrl?: string | null;
  } | null;
};

export type ReferralLinkResponse = {
  code: string;
  shareUrl: string;
  referralCount: number;
  referrerName: string;
};

export type NotificationRow = { id: string; target: string; isRead: boolean };

export type NotificationsResponse = { notifications: NotificationRow[]; total: number };

export type OpenSlotsResponse = {
  slots: { id: string; startAtUtc: string; endAtUtc: string }[];
};

// What the Home screen and the screens that borrow its care team work with.
export type CareTeamDoctor = CareTeamMember & { hasOpenSlots: boolean };

export type PatientDashboard = Omit<
  DashboardResponse,
  'careTeam' | 'nowUtc' | 'nextAppointment'
> & {
  careTeam: CareTeamDoctor[];
};

export type ReferralLink = Pick<ReferralLinkResponse, 'code' | 'shareUrl'>;

export type HomeData = {
  firstName: string;
  unreadCount: number;
  dashboard: PatientDashboard;
  referral: ReferralLink;
};
