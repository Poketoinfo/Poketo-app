export type TransactionType = 'pret' | 'dette';

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  contact_name: string;
  note: string | null;
  photo_url: string | null;
  created_at: string;
};
