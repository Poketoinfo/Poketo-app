import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { addLog } from './debugLog';

// Diagnostic : le code_verifier PKCE est stocké par supabase-js sous une clé
// du type "sb-<project-ref>-auth-token-code-verifier". Un mismatch (aucune
// clé trouvée, ou une valeur qui ne correspond pas au code cliqué) donne
// exactement l'erreur "invalid flow state, no valid flow state found".
// Généralement causé par plusieurs demandes de reset successives : chaque
// appel à resetPasswordForEmail écrase le verifier précédent, donc cliquer
// un ANCIEN mail après en avoir redemandé un nouveau casse le lien.
async function logVerifierState() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const verifierKeys = allKeys.filter((k) => k.includes('code-verifier'));
    if (verifierKeys.length === 0) {
      addLog('DIAGNOSTIC: aucune clé code-verifier trouvée dans AsyncStorage');
      return;
    }
    for (const key of verifierKeys) {
      const value = await AsyncStorage.getItem(key);
      addLog(`DIAGNOSTIC: ${key} = ${value?.slice(0, 12)}...`);
    }
  } catch (e: any) {
    addLog(`DIAGNOSTIC: erreur lecture AsyncStorage: ${e?.message}`);
  }
}

export type RecoveryOutcome = 'valid' | 'invalid';

// ---------------------------------------------------------------------------
// Verrou de dédoublonnage.
//
// Sur Android en particulier, la même URL de lancement peut déclencher
// l'event 'url' sur PLUSIEURS listeners en parallèle (celui de SplashScreen
// ET celui de RootNavigator, tous deux montés très tôt au cold start). Un
// code PKCE (ou un token_hash OTP) est à usage unique : si deux appelants
// tentent l'échange en même temps, l'un réussit et l'autre échoue avec une
// erreur "invalid grant" / "expired" — ce qui donnait l'impression d'un lien
// systématiquement grillé.
//
// claimRecoveryUrl() garantit qu'une URL donnée n'est traitée (exchange +
// navigation) que par le PREMIER appelant. Tout appelant suivant pour la
// même URL reçoit `null` et ne doit rien faire — l'autre s'occupe déjà de la
// navigation.
// ---------------------------------------------------------------------------
let claimedUrl: string | null = null;
let claimedPromise: Promise<RecoveryOutcome> | null = null;

export function claimRecoveryUrl(rawUrl: string): Promise<RecoveryOutcome> | null {
  if (claimedUrl === rawUrl && claimedPromise) {
    addLog(`claimRecoveryUrl: URL déjà réclamée par un autre listener → ignoré ici`);
    return null;
  }
  addLog(`claimRecoveryUrl: URL réclamée, début du traitement`);
  claimedUrl = rawUrl;
  claimedPromise = handleRecoveryUrl(rawUrl);
  return claimedPromise;
}

// Point de traitement UNIQUE pour les liens de récupération de mot de passe.
// Ne jamais appeler directement depuis un listener — passer par
// claimRecoveryUrl() pour éviter la double consommation du code.
async function handleRecoveryUrl(rawUrl: string): Promise<RecoveryOutcome> {
  try {
    const parsed = Linking.parse(rawUrl);
    const qp = parsed.queryParams ?? {};
    addLog(`handleRecoveryUrl: params détectés = ${JSON.stringify(qp)}`);

    const errorCode = (qp.error_code || qp.error) as string | undefined;
    if (errorCode) {
      addLog(`Lien invalide (error_code): ${qp.error_description ?? errorCode}`);
      return 'invalid';
    }

    const code = qp.code as string | undefined;
    if (code) {
      addLog(`Code reçu dans l'URL (préfixe): ${code.slice(0, 12)}...`);
      await logVerifierState();
      addLog(`Tentative exchangeCodeForSession...`);
      const { error } = await supabase.auth.exchangeCodeForSession(rawUrl);
      if (error) {
        addLog(`exchangeCodeForSession ÉCHEC: ${error.message}`);
        return 'invalid';
      }
      addLog(`exchangeCodeForSession OK`);
      return 'valid';
    }

    const tokenHash = (qp.token_hash || qp.token) as string | undefined;
    if (tokenHash) {
      addLog(`Tentative verifyOtp...`);
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      });
      if (error) {
        addLog(`verifyOtp ÉCHEC: ${error.message}`);
        return 'invalid';
      }
      addLog(`verifyOtp OK`);
      return 'valid';
    }

    const hashPart = rawUrl.split('#')[1];
    if (hashPart) {
      const params = new URLSearchParams(hashPart);
      const hashError = params.get('error_code') || params.get('error');
      if (hashError) {
        addLog(`Lien invalide (hash error): ${hashError}`);
        return 'invalid';
      }

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        addLog(`Tentative setSession (tokens en hash)...`);
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          addLog(`setSession ÉCHEC: ${error.message}`);
          return 'invalid';
        }
        addLog(`setSession OK`);
        return 'valid';
      }
    }

    addLog(`Aucun code/token_hash/hash exploitable trouvé dans l'URL → invalid`);
    return 'invalid';
  } catch (e: any) {
    addLog(`handleRecoveryUrl EXCEPTION: ${e?.message}`);
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