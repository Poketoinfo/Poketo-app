import * as Linking from 'expo-linking';
import { supabase } from './supabase';

export type RecoveryOutcome = 'valid' | 'invalid';

// Point de traitement UNIQUE pour les liens de récupération de mot de passe.
// Doit être appelé une seule fois par URL (code PKCE / token OTP à usage
// unique).
export async function handleRecoveryUrl(rawUrl: string): Promise<RecoveryOutcome> {
  try {
    const parsed = Linking.parse(rawUrl);
    const qp = parsed.queryParams ?? {};

    const errorCode = (qp.error_code || qp.error) as string | undefined;
    if (errorCode) {
      console.warn('Lien de récupération invalide:', qp.error_description ?? errorCode);
      return 'invalid';
    }

    const code = qp.code as string | undefined;
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(rawUrl);
      if (error) {
        console.warn('exchangeCodeForSession error:', error.message);
        return 'invalid';
      }
      return 'valid';
    }

    const tokenHash = (qp.token_hash || qp.token) as string | undefined;
    if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      });
      if (error) {
        console.warn('verifyOtp error:', error.message);
        return 'invalid';
      }
      return 'valid';
    }

    const hashPart = rawUrl.split('#')[1];
    if (hashPart) {
      const params = new URLSearchParams(hashPart);
      const hashError = params.get('error_code') || params.get('error');
      if (hashError) return 'invalid';

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          console.warn('setSession error:', error.message);
          return 'invalid';
        }
        return 'valid';
      }
    }

    return 'invalid';
  } catch (e: any) {
    console.warn('handleRecoveryUrl threw:', e?.message);
    return 'invalid';
  }
}

// Détection volontairement tolérante : on ne se fie pas uniquement au
// parsing hostname/path de expo-linking (son comportement varie selon
// Expo Go / build standalone / Android / iOS pour un schéma custom). On
// cherche directement la présence du segment dans l'URL brute, en
// s'appuyant en complément sur les query params attendus pour ce flux.
export function isResetPasswordUrl(rawUrl: string): boolean {
  if (rawUrl.includes('reset-password')) return true;
  try {
    const parsed = Linking.parse(rawUrl);
    const qp = parsed.queryParams ?? {};
    const type = qp.type as string | undefined;
    return type === 'recovery';
  } catch {
    return false;
  }
}