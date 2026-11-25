export type PriceRequest = {
  id: string;
  reference: string;
  tests: string[];
  area: string;
  expiresAt: string;
  replies: { id: string; lab: string; note: string; totalKobo: number }[];
};
