export type SavedCard = {
  id: string;
  brand: string | null;
  last4: string;
  expiry: string | null;
  isDefault: boolean;
};
