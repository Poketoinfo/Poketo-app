export type LanguageCode = 'fr' | 'en' | 'mg';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  fr: 'Français',
  en: 'English',
  mg: 'Malagasy',
};

type TranslationKeys = {
  appName: string;

  // Auth
  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailOrUsernameLabel: string;
  emailOrUsernamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  loginButton: string;
  noAccount: string;
  createAccount: string;
  signupTitle: string;
  signupSubtitle: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  signupButton: string;
  haveAccount: string;
  backToLogin: string;
  forgotPassword: string;
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  sendResetLink: string;
  resetLinkSent: string;
  newPasswordLabel: string;
  resetPasswordTitle: string;
  resetPasswordSubtitle: string;
  resetPasswordButton: string;
  resetPasswordSuccess: string;
  verifyEmailTitle: string;
  verifyEmailMessage: string;
  resetPasswordVerifying: string;

  // Home
  balanceGlobal: string;
  onMeDoit: string;
  jeDois: string;
  recentOps: string;
  results: string;
  searchPlaceholder: string;
  noOpsYet: string;
  noResults: string;
  loan: string;
  debt: string;
  dueToday: string;
  overdue: string;
  dueInDays: string;
  addButton: string;

  // Add transaction
  addTitle: string;
  selectType: string;
  iLent: string;
  iBorrowed: string;
  amount: string;
  contactLabel: string;
  contactPlaceholder: string;
  dueDateLabel: string;
  dueDateHint: string;
  optionsLabel: string;
  addNote: string;
  notePlaceholder: string;
  addPhoto: string;
  changePhoto: string;
  takePhoto: string;
  chooseFromLibrary: string;
  removePhoto: string;
  validate: string;
  removeDate: string;
  selectDate: string;

  // Detail
  detailTitle: string;
  editTitle: string;
  addedOn: string;
  save: string;
  cancel: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  deleteConfirmYes: string;
  deleteConfirmNo: string;
  notFound: string;

  // Settings
  settingsTitle: string;
  currencyLabel: string;
  languageLabel: string;
  systemLanguage: string;
  logout: string;

  // Errors
  errorFillFields: string;
  errorInvalidEmail: string;
  errorPasswordShort: string;
  errorInvalidAmount: string;
  errorNameRequired: string;
  errorGeneric: string;
  errorPhotoPermission: string;
  errorCameraPermission: string;
  errorUserNotFound: string;
};

export const translations: Record<LanguageCode, TranslationKeys> = {
  fr: {
    appName: 'Poketo',
    resetPasswordVerifying: 'Vérification du lien en cours...',

    loginTitle: 'Connexion',
    loginSubtitle: 'Content de te revoir',
    emailLabel: 'E-mail',
    emailPlaceholder: 'toi@exemple.com',
    emailOrUsernameLabel: "E-mail ou nom d'utilisateur",
    emailOrUsernamePlaceholder: 'toi@exemple.com ou pseudo',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: '••••••••',
    loginButton: 'Se connecter',
    noAccount: 'Pas encore de compte ?',
    createAccount: 'Créer un compte',
    signupTitle: 'Créer un compte',
    signupSubtitle: 'Rejoins-nous en quelques secondes',
    usernameLabel: "Nom d'utilisateur",
    usernamePlaceholder: 'ex : Poketo_user',
    signupButton: "S'inscrire",
    haveAccount: 'Déjà un compte ?',
    backToLogin: 'Se connecter',
    forgotPassword: 'Mot de passe oublié ?',
    forgotPasswordTitle: 'Mot de passe oublié',
    forgotPasswordSubtitle: 'Entre ton e-mail pour recevoir un lien de réinitialisation.',
    sendResetLink: 'Envoyer le lien',
    resetLinkSent: 'E-mail envoyé ! Vérifie ta boîte de réception.',
    newPasswordLabel: 'Nouveau mot de passe',
    resetPasswordTitle: 'Réinitialiser le mot de passe',
    resetPasswordSubtitle: 'Choisis un nouveau mot de passe pour ton compte.',
    resetPasswordButton: 'Réinitialiser',
    resetPasswordSuccess: 'Mot de passe mis à jour ! Tu peux te connecter.',
    verifyEmailTitle: 'Confirme ton compte',
    verifyEmailMessage: "Un e-mail de confirmation a été envoyé à {email}. Clique sur le lien pour activer ton compte, puis reviens te connecter.",

    balanceGlobal: 'Balance globale',
    onMeDoit: 'On me doit',
    jeDois: 'Je dois',
    recentOps: 'Dernières opérations',
    results: 'Résultats',
    searchPlaceholder: 'Rechercher un nom, une note...',
    noOpsYet: "Aucune opération pour l'instant. Ajoute ta première avec le bouton ci-dessous.",
    noResults: 'Aucune opération ne correspond à ta recherche.',
    loan: 'Prêt',
    debt: 'Dette',
    dueToday: "Échéance aujourd'hui",
    overdue: 'Échéance dépassée',
    dueInDays: 'Échéance dans {n} j',
    addButton: 'Ajouter',

    addTitle: 'Nouvelle opération',
    selectType: 'Sélectionner le type',
    iLent: "J'ai prêté",
    iBorrowed: "J'ai emprunté",
    amount: 'Montant',
    contactLabel: 'À qui ? / De qui ?',
    contactPlaceholder: 'Entrez un nom... (ex: Paul)',
    dueDateLabel: "Date d'échéance (optionnel)",
    dueDateHint: 'Rappel automatique 5 jours avant, et alerte le jour même.',
    optionsLabel: 'Options (optionnel)',
    addNote: 'Ajouter une note / explication',
    notePlaceholder: 'ex : prêté pour le resto',
    addPhoto: 'Prendre / Ajouter une photo',
    changePhoto: 'Changer la photo',
    takePhoto: 'Prendre une photo',
    chooseFromLibrary: 'Choisir depuis la galerie',
    removePhoto: 'Supprimer la photo',
    validate: "Valider l'action",
    removeDate: 'Retirer',
    selectDate: 'Sélectionner une date',

    detailTitle: "Détail de l'opération",
    editTitle: 'Modifier',
    addedOn: 'Ajouté le',
    save: 'Enregistrer',
    cancel: 'Annuler',
    deleteConfirmTitle: "Supprimer l'opération ?",
    deleteConfirmMessage: 'Cette action est définitive et ne peut pas être annulée.',
    deleteConfirmYes: 'Supprimer',
    deleteConfirmNo: 'Annuler',
    notFound: 'Opération introuvable.',

    settingsTitle: 'Réglages',
    currencyLabel: 'Devise',
    languageLabel: 'Langue',
    systemLanguage: 'Automatique (système)',
    logout: 'Se déconnecter',

    errorFillFields: 'Merci de remplir tous les champs.',
    errorInvalidEmail: 'Adresse e-mail invalide.',
    errorPasswordShort: 'Le mot de passe doit contenir au moins 6 caractères.',
    errorInvalidAmount: "Merci d'indiquer un montant valide.",
    errorNameRequired: "Merci d'indiquer un nom.",
    errorGeneric: 'Une erreur est survenue, réessaie.',
    errorPhotoPermission: "L'accès aux photos est nécessaire.",
    errorCameraPermission: "L'accès à la caméra est nécessaire.",
    errorUserNotFound: 'Utilisateur introuvable.',
  },

  en: {
    appName: 'Poketo',
    resetPasswordVerifying: 'Verifying link...',

    loginTitle: 'Log in',
    loginSubtitle: 'Welcome back',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    emailOrUsernameLabel: 'Email or username',
    emailOrUsernamePlaceholder: 'you@example.com or username',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    loginButton: 'Log in',
    noAccount: "Don't have an account?",
    createAccount: 'Create an account',
    signupTitle: 'Create an account',
    signupSubtitle: 'Join in a few seconds',
    usernameLabel: 'Username',
    usernamePlaceholder: 'e.g. Poketo_user',
    signupButton: 'Sign up',
    haveAccount: 'Already have an account?',
    backToLogin: 'Log in',
    forgotPassword: 'Forgot password?',
    forgotPasswordTitle: 'Forgot password',
    forgotPasswordSubtitle: 'Enter your email to receive a reset link.',
    sendResetLink: 'Send reset link',
    resetLinkSent: 'Email sent! Check your inbox.',
    newPasswordLabel: 'New password',
    resetPasswordTitle: 'Reset password',
    resetPasswordSubtitle: 'Choose a new password for your account.',
    resetPasswordButton: 'Reset password',
    resetPasswordSuccess: 'Password updated! You can now log in.',
    verifyEmailTitle: 'Confirm your account',
    verifyEmailMessage: 'A confirmation email was sent to {email}. Click the link to activate your account, then come back to log in.',

    balanceGlobal: 'Overall balance',
    onMeDoit: 'Owed to me',
    jeDois: 'I owe',
    recentOps: 'Recent activity',
    results: 'Results',
    searchPlaceholder: 'Search a name, a note...',
    noOpsYet: 'No transactions yet. Add your first one with the button below.',
    noResults: 'No transaction matches your search.',
    loan: 'Loan',
    debt: 'Debt',
    dueToday: 'Due today',
    overdue: 'Overdue',
    dueInDays: 'Due in {n} d',
    addButton: 'Add',

    addTitle: 'New transaction',
    selectType: 'Select the type',
    iLent: 'I lent',
    iBorrowed: 'I borrowed',
    amount: 'Amount',
    contactLabel: 'To whom? / From whom?',
    contactPlaceholder: 'Enter a name... (e.g. Paul)',
    dueDateLabel: 'Due date (optional)',
    dueDateHint: 'Automatic reminder 5 days before, and alert on the day.',
    optionsLabel: 'Options (optional)',
    addNote: 'Add a note / explanation',
    notePlaceholder: 'e.g. lent for the restaurant',
    addPhoto: 'Take / Add a photo',
    changePhoto: 'Change photo',
    takePhoto: 'Take a photo',
    chooseFromLibrary: 'Choose from library',
    removePhoto: 'Remove photo',
    validate: 'Confirm',
    removeDate: 'Remove',
    selectDate: 'Select a date',

    detailTitle: 'Transaction details',
    editTitle: 'Edit',
    addedOn: 'Added on',
    save: 'Save',
    cancel: 'Cancel',
    deleteConfirmTitle: 'Delete this transaction?',
    deleteConfirmMessage: 'This action is permanent and cannot be undone.',
    deleteConfirmYes: 'Delete',
    deleteConfirmNo: 'Cancel',
    notFound: 'Transaction not found.',

    settingsTitle: 'Settings',
    currencyLabel: 'Currency',
    languageLabel: 'Language',
    systemLanguage: 'Automatic (system)',
    logout: 'Log out',

    errorFillFields: 'Please fill in all fields.',
    errorInvalidEmail: 'Invalid email address.',
    errorPasswordShort: 'Password must be at least 6 characters.',
    errorInvalidAmount: 'Please enter a valid amount.',
    errorNameRequired: 'Please enter a name.',
    errorGeneric: 'Something went wrong, please try again.',
    errorPhotoPermission: 'Photo access is required.',
    errorCameraPermission: 'Camera access is required.',
    errorUserNotFound: 'User not found.',
  },

  mg: {
    appName: 'Poketo',
    resetPasswordVerifying: 'Manamarina ny rohy...',

    loginTitle: 'Hiditra',
    loginSubtitle: 'Tonga soa indray',
    emailLabel: 'Mailaka',
    emailPlaceholder: 'ianao@ohatra.com',
    emailOrUsernameLabel: 'Mailaka na anaram-pikasa',
    emailOrUsernamePlaceholder: "ianao@ohatra.com na anaram-pikasa",
    passwordLabel: 'Tenimiafina',
    passwordPlaceholder: '••••••••',
    loginButton: 'Hiditra',
    noAccount: 'Mbola tsy manana kaonty?',
    createAccount: 'Mamorona kaonty',
    signupTitle: 'Mamorona kaonty',
    signupSubtitle: 'Midira ao anatin\'ny segondra vitsivitsy',
    usernameLabel: "Anaram-pikasa",
    usernamePlaceholder: 'ohatra: Poketo_user',
    signupButton: 'Misoratra anarana',
    haveAccount: 'Efa manana kaonty?',
    backToLogin: 'Hiditra',
    forgotPassword: 'Hadino ny tenimiafina?',
    forgotPasswordTitle: 'Hadino ny tenimiafina',
    forgotPasswordSubtitle: "Ampidino ny mailakao mba handraisana rohy fanavaozana.",
    sendResetLink: 'Alefaso ny rohy',
    resetLinkSent: 'Nalefa ny mailaka! Jereo ny boaty mailakao.',
    newPasswordLabel: 'Tenimiafina vaovao',
    resetPasswordTitle: 'Fanavaozana tenimiafina',
    resetPasswordSubtitle: 'Safidio ny tenimiafina vaovao ho an\'ny kaontinao.',
    resetPasswordButton: 'Avaoy',
    resetPasswordSuccess: 'Voaova ny tenimiafina! Azonao atao ny hiditra.',
    verifyEmailTitle: 'Ekeo ny kaontinao',
    verifyEmailMessage: "Nalefa tany amin'ny {email} ny mailaka fanamarinana. Kitiho ny rohy mba hanamarinana ny kaontinao, avy eo miverina hiditra.",

    balanceGlobal: 'Balance manontolo',
    onMeDoit: 'Trosa amiko',
    jeDois: 'Trosako',
    recentOps: 'Fikarohana farany',
    results: 'Valiny',
    searchPlaceholder: 'Katsaho anarana, fanamarihana...',
    noOpsYet: "Mbola tsy misy fifanakalozana. Ampio ny voalohany amin'ny bokotra eto ambany.",
    noResults: 'Tsy misy mifanaraka amin\'ny katsahinao.',
    loan: 'Trosa nomena',
    debt: 'Trosa noraisina',
    dueToday: 'Fetr\'andro androany',
    overdue: 'Lasa ny fetr\'andro',
    dueInDays: "Sisa {n} andro",
    addButton: 'Ampio',

    addTitle: 'Fifanakalozana vaovao',
    selectType: 'Safidio ny karazana',
    iLent: 'Nampindrana aho',
    iBorrowed: 'Nindrana aho',
    amount: 'Vola',
    contactLabel: 'Amin\'iza? / Avy amin\'iza?',
    contactPlaceholder: 'Ampidino ny anarana... (ohatra: Paul)',
    dueDateLabel: 'Fetr\'andro (tsy tsy maintsy)',
    dueDateHint: 'Fampahatsiahivana 5 andro mialoha, ary fampandrenesana amin\'ny andro mihitsy.',
    optionsLabel: 'Safidy hafa (tsy tsy maintsy)',
    addNote: 'Ampio fanamarihana',
    notePlaceholder: 'ohatra: nampindramina ho an\'ny sakafo',
    addPhoto: 'Maka / Ampio sary',
    changePhoto: 'Ovay ny sary',
    takePhoto: 'Maka sary',
    chooseFromLibrary: "Safidio avy amin'ny sary voatahiry",
    removePhoto: 'Fafao ny sary',
    validate: 'Ekeo',
    removeDate: 'Esory',
    selectDate: 'Safidio ny daty',

    detailTitle: 'Antsipirihan\'ny fifanakalozana',
    editTitle: 'Ovay',
    addedOn: 'Nampiana tamin\'ny',
    save: 'Tehirizo',
    cancel: 'Aoka ihany',
    deleteConfirmTitle: 'Fafao ity fifanakalozana ity?',
    deleteConfirmMessage: 'Tsy azo averina intsony ity fihetsika ity.',
    deleteConfirmYes: 'Fafao',
    deleteConfirmNo: 'Aoka ihany',
    notFound: 'Tsy hita ny fifanakalozana.',

    settingsTitle: 'Fandrindrana',
    currencyLabel: 'Vola mpiasa',
    languageLabel: 'Fiteny',
    systemLanguage: 'Ho azy (rafitra)',
    logout: 'Hivoaka',

    errorFillFields: 'Fenoy daholo ny fisokafana.',
    errorInvalidEmail: 'Mailaka diso.',
    errorPasswordShort: 'Tsy maintsy 6 tarehin-tsoratra farafahakeliny ny tenimiafina.',
    errorInvalidAmount: 'Ampidino ny vola marina.',
    errorNameRequired: 'Ampidino ny anarana.',
    errorGeneric: 'Nisy olana, andramo indray.',
    errorPhotoPermission: 'Ilaina ny fidirana amin\'ny sary.',
    errorCameraPermission: 'Ilaina ny fidirana amin\'ny kamera.',
    errorUserNotFound: 'Tsy hita ny mpikambana.',
  },
};

export function translate(lang: LanguageCode, key: keyof TranslationKeys, vars?: Record<string, string | number>): string {
  let text = translations[lang][key] ?? translations.fr[key];
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}