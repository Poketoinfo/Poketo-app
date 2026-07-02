import { supabase } from './supabase';

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

export type NewTransaction = {
  type: TransactionType;
  amount: number;
  contact_name: string;
  note?: string | null;
  photo_url?: string | null;
};

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addTransaction(payload: NewTransaction) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Utilisateur non connecté.');

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type: payload.type,
    amount: payload.amount,
    contact_name: payload.contact_name,
    note: payload.note || null,
    photo_url: payload.photo_url || null,
  });

  if (error) throw error;
}

export function computeBalances(transactions: Transaction[]) {
  const onMeDoit = transactions
    .filter((t) => t.type === 'pret')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const jeDois = transactions
    .filter((t) => t.type === 'dette')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    onMeDoit,
    jeDois,
    balanceGlobale: onMeDoit - jeDois,
  };
}

/**
 * Upload une photo (URI locale) vers le bucket "receipts" de Supabase Storage
 * et retourne l'URL publique. Le bucket doit exister et être public
 * (voir instructions Supabase fournies).
 */
export async function uploadReceiptPhoto(localUri: string, userId: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const fileExt = localUri.split('.').pop()?.split('?')[0] || 'jpg';
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(fileName, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
  return data.publicUrl;
}