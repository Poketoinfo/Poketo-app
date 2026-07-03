import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export type TransactionType = 'pret' | 'dette';

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  contact_name: string;
  note: string | null;
  photo_url: string | null;
  due_date: string | null; // format ISO "YYYY-MM-DD"
  created_at: string;
};

export type NewTransaction = {
  type: TransactionType;
  amount: number;
  contact_name: string;
  note?: string | null;
  photo_url?: string | null;
  due_date?: string | null;
};

export type UpdateTransaction = Partial<NewTransaction>;

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function addTransaction(payload: NewTransaction): Promise<Transaction> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Utilisateur non connecté.');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: payload.type,
      amount: payload.amount,
      contact_name: payload.contact_name,
      note: payload.note || null,
      photo_url: payload.photo_url || null,
      due_date: payload.due_date || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, payload: UpdateTransaction) {
  const { error } = await supabase
    .from('transactions')
    .update({
      ...(payload.type !== undefined && { type: payload.type }),
      ...(payload.amount !== undefined && { amount: payload.amount }),
      ...(payload.contact_name !== undefined && { contact_name: payload.contact_name }),
      ...(payload.note !== undefined && { note: payload.note || null }),
      ...(payload.photo_url !== undefined && { photo_url: payload.photo_url || null }),
      ...(payload.due_date !== undefined && { due_date: payload.due_date || null }),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
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
 *
 * On lit le fichier en base64 puis on le convertit en ArrayBuffer plutôt que
 * de passer par fetch().blob(), qui échoue en build standalone avec l'erreur
 * "Creating blobs from 'ArrayBuffer' and 'ArrayBufferView' are not supported".
 */
export async function uploadReceiptPhoto(localUri: string, userId: string): Promise<string> {
  const fileExt = localUri.split('.').pop()?.split('?')[0] || 'jpg';
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decode(base64);

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(fileName, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
  return data.publicUrl;
}
