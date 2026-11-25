// The patient's referral link, as the server sends it. Joined counts every patient who
// registered through one of the patient's referral codes.
export type RawReferralLink = {
  code: string;
  shareUrl: string;
  referralCount: number;
  referrerName: string;
};

export type ReferralLink = {
  code: string;
  shareUrl: string;
  joined: number;
};
