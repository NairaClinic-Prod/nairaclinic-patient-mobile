export const REFERRAL_STEPS = [
  { title: 'Share your invite', text: 'Send your personal link or code to friends and family.' },
  {
    title: 'They create an account',
    text: 'The invitation is credited when a new patient registers through your link.',
  },
  {
    title: 'Privacy stays protected',
    text: 'You see the referral count, never another patient’s health information.',
  },
] as const;

export const REFERRAL_FAQ = [
  {
    question: 'What can I see about referrals?',
    answer:
      'Only your referral count is available. Health and private account details are never shared.',
  },
  {
    question: 'Does my link expire?',
    answer:
      'Your patient referral link is reusable. If it stops working, reopen this page to get the current link.',
  },
  {
    question: 'Where are coin rewards shown?',
    answer:
      'Your coin balance shows on your Wallet. Coins are applied when you choose an offer and pay.',
  },
] as const;
