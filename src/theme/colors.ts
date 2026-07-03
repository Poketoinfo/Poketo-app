export const colors = {
  primary: '#1E5EFF',      // bleu principal
  primaryDark: '#123FBF',  // bleu profond (pressed, accents)
  primaryLight: '#EAF0FF', // bleu très pâle (fonds, champs)
  background: '#FFFFFF',
  surface: '#F7F9FC',
  text: '#101828',
  textSecondary: '#667085',
  border: '#E4E7EC',
  error: '#E4362F',
  white: '#FFFFFF',
  success: '#12A150',
  successLight: '#E7F8EF',
  danger: '#E4362F',
  dangerLight: '#FDECEC',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
};

import { Platform } from 'react-native';

export const shadow = {
  soft: Platform.select({
    web: { boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.06)' },
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  }),
  fab: Platform.select({
    web: { boxShadow: '0px 6px 14px rgba(30, 94, 255, 0.35)' },
    default: {
      shadowColor: '#1E5EFF',
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
  }),
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
};
