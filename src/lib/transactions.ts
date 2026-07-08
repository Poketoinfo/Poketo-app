import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { CurrencyCode } from './currency';

export type TransactionType = 'pret' | 'dette';
export type TransactionStatus = 'en_cours' | 'en_attente_validation' | 'paye';

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  contact_name: string;
  note: string | null;
  photo_url: string | null;
  due_date: string | null;
  status: TransactionStatus;
  created_at: string;
};

export type NewTransaction = {
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  contact_name: string;
  note?: string | null;
  photo_url?: string | null;
  due_date: string;
};

export type UpdateTransaction = Partial<NewTransaction> & {
  status?: TransactionStatus;
};

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchTransactionsByType(type: TransactionType): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', type)
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
      currency: payload.currency,
      contact_name: payload.contact_name,
      note: payload.note || null,
      photo_url: payload.photo_url || null,
      due_date: payload.due_date,
      status: 'en_cours',
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
      ...(payload.currency !== undefined && { currency: payload.currency }),
      ...(payload.contact_name !== undefined && { contact_name: payload.contact_name }),
      ...(payload.note !== undefined && { note: payload.note || null }),
      ...(payload.photo_url !== undefined && { photo_url: payload.photo_url || null }),
      ...(payload.due_date !== undefined && { due_date: payload.due_date }),
      ...(payload.status !== undefined && { status: payload.status }),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function updateTransactionStatus(id: string, status: TransactionStatus) {
  const { error } = await supabase.from('transactions').update({ status }).eq('id', id);
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
 * Vérifie les transactions dont l'échéance est dépassée et encore "en_cours".
 * Les passe en "en_attente_validation" et retourne la liste des transactions
 * nouvellement marquées, pour permettre d'envoyer une notification.
 */
export async function checkOverdueTransactions(transactions: Transaction[]): Promise<Transaction[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = transactions.filter((t) => {
    if (t.status !== 'en_cours' || !t.due_date) return false;
    const due = new Date(`${t.due_date}T00:00:00`);
    return due.getTime() < today.getTime();
  });

  if (overdue.length === 0) return [];

  await Promise.all(
    overdue.map((t) =>
      supabase.from('transactions').update({ status: 'en_attente_validation' }).eq('id', t.id)
    )
  );

  return overdue.map((t) => ({ ...t, status: 'en_attente_validation' as TransactionStatus }));
}

/**
 * Upload une photo (URI locale) vers le bucket "receipts" de Supabase Storage
 * et retourne l'URL publique.
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

export function computeBalancesRaw(transactions: Transaction[]) {
  const onMeDoit = transactions.filter((t) => t.type === 'pret').length;
  const jeDois = transactions.filter((t) => t.type === 'dette').length;
  return { onMeDoit, jeDois };
}