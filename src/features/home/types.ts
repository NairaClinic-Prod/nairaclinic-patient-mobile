export type DashboardAppointment = {
  id: string;
  status: string;
  scheduledAtUtc: string | null;
  durationMins: number | null;
  doctorName: string;
  isSmartRequest: boolean;
  isInPerson: boolean;
};

export type CareTeamDoctor = {
  doctorUserId: string;
  name: string;
  specialty: string | null;
  photoUrl: string | null;
  bookingSlug: string | null;
  hasOpenSlots: boolean;
};

export type PatientDashboard = {
  upcoming: DashboardAppointment[];
  readyNow: DashboardAppointment[];
  healthTips: string[];
  careTeam: CareTeamDoctor[];
};

export type ReferralLink = {
  code: string;
  shareUrl: string;
};

export type HomeData = {
  firstName: string;
  unreadCount: number;
  dashboard: PatientDashboard;
  referral: ReferralLink;
};
