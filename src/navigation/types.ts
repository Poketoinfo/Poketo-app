export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
ResetPassword: { prehandled?: boolean; status?: 'valid' | 'invalid' } | undefined;
  Home: undefined;
  AddTransaction: { fixedType?: 'pret' | 'dette' } | undefined;
  Settings: undefined;
  Profile: undefined;
  TransactionDetail: { id: string };
  TransactionHistory: { type: 'pret' | 'dette' };
};