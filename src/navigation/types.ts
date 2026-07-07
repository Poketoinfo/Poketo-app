export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Home: undefined;
  AddTransaction: undefined;
  Settings: undefined;
  TransactionDetail: { id: string };
};