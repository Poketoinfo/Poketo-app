export type LanguageCode = 'fr' | 'en' | 'mg' | 'es' | 'de';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  fr: 'Français',
  en: 'English',
  mg: 'Malagasy',
  es: 'Español',
  de: 'Deutsch',
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
  resetLinkInvalid: string;

  // --- Ajouter dans TranslationKeys ---
  // Profile
  profileTitle: string;
  personalInfo: string;
  usernameFieldLabel: string;
  emailFieldLabel: string;
  changePasswordTitle: string;
  currentPasswordLabel: string;
  newPasswordFieldLabel: string;
  confirmPasswordLabel: string;
  savePersonalInfo: string;
  savePasswordButton: string;
  passwordUpdated: string;
  infoUpdated: string;
  errorPasswordMismatch: string;
  profileMenuItem: string;

  // History
  historyTitle: string;
  historyLoans: string;
  historyDebts: string;

  // Status
  statusLabel: string;
  statusEnCours: string;
  statusEnAttenteValidation: string;
  statusPaye: string;
  changeStatus: string;
  overdueNotifTitle: string;
  overdueNotifBody: string;

  errorDueDateRequired: string;

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
    resetLinkInvalid: 'Ce lien de réinitialisation est invalide ou a expiré. Demande un nouveau lien.',

    profileTitle: 'Mon profil',
    personalInfo: 'Informations personnelles',
    usernameFieldLabel: "Nom d'utilisateur",
    emailFieldLabel: 'E-mail',
    changePasswordTitle: 'Changer le mot de passe',
    currentPasswordLabel: 'Mot de passe actuel',
    newPasswordFieldLabel: 'Nouveau mot de passe',
    confirmPasswordLabel: 'Confirmer le mot de passe',
    savePersonalInfo: 'Enregistrer les informations',
    savePasswordButton: 'Mettre à jour le mot de passe',
    passwordUpdated: 'Mot de passe mis à jour !',
    infoUpdated: 'Informations mises à jour !',
    errorPasswordMismatch: 'Les mots de passe ne correspondent pas.',
    profileMenuItem: 'Profil',

    historyTitle: 'Historique',
    historyLoans: 'Prêts',
    historyDebts: 'Dettes',

    statusLabel: 'Statut',
    statusEnCours: 'En cours',
    statusEnAttenteValidation: 'En attente de validation',
    statusPaye: 'Payé',
    changeStatus: 'Changer le statut',
    overdueNotifTitle: 'Échéance dépassée',
    overdueNotifBody: '{name} a dépassé sa date d\'échéance.',

    errorDueDateRequired: "La date d'échéance est obligatoire.",

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
    dueDateLabel: "Date d'échéance",
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
    resetLinkInvalid: 'This reset link is invalid or has expired. Request a new one.',

    profileTitle: 'My profile',
    personalInfo: 'Personal information',
    usernameFieldLabel: 'Username',
    emailFieldLabel: 'Email',
    changePasswordTitle: 'Change password',
    currentPasswordLabel: 'Current password',
    newPasswordFieldLabel: 'New password',
    confirmPasswordLabel: 'Confirm password',
    savePersonalInfo: 'Save information',
    savePasswordButton: 'Update password',
    passwordUpdated: 'Password updated!',
    infoUpdated: 'Information updated!',
    errorPasswordMismatch: 'Passwords do not match.',
    profileMenuItem: 'Profile',

    historyTitle: 'History',
    historyLoans: 'Loans',
    historyDebts: 'Debts',

    statusLabel: 'Status',
    statusEnCours: 'In progress',
    statusEnAttenteValidation: 'Pending validation',
    statusPaye: 'Paid',
    changeStatus: 'Change status',
    overdueNotifTitle: 'Overdue',
    overdueNotifBody: '{name} is past its due date.',

    errorDueDateRequired: 'The due date is required.',

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
    dueDateLabel: 'Due date',
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
    resetLinkInvalid: 'Diso na lany daty ity rohy fanavaozana ity. Mangataha rohy vaovao.',

    profileTitle: 'Ny mombamomba ahy',
    personalInfo: 'Mombamomba manokana',
    usernameFieldLabel: 'Anaram-pikasa',
    emailFieldLabel: 'Mailaka',
    changePasswordTitle: 'Ovay ny tenimiafina',
    currentPasswordLabel: 'Tenimiafina ankehitriny',
    newPasswordFieldLabel: 'Tenimiafina vaovao',
    confirmPasswordLabel: 'Hamafiso ny tenimiafina',
    savePersonalInfo: 'Tehirizo ny mombamomba',
    savePasswordButton: 'Avaoy ny tenimiafina',
    passwordUpdated: 'Voaova ny tenimiafina!',
    infoUpdated: 'Voaova ny mombamomba!',
    errorPasswordMismatch: 'Tsy mitovy ny tenimiafina.',
    profileMenuItem: 'Momba ahy',

    historyTitle: 'Tantara',
    historyLoans: 'Trosa nomena',
    historyDebts: 'Trosa noraisina',

    statusLabel: 'Sata',
    statusEnCours: 'Mandeha',
    statusEnAttenteValidation: 'Miandry fanamarinana',
    statusPaye: 'Voaloa',
    changeStatus: 'Ovay ny sata',
    overdueNotifTitle: 'Lasa ny fetr\'andro',
    overdueNotifBody: 'Lasa ny fetr\'andron\'i {name}.',

    errorDueDateRequired: "Ilaina ny fetr'andro.",

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
    onMeDoit: 'Trosa nomena',
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
    dueDateLabel: "Fetr\'andro",
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

  es: {
    appName: 'Poketo',
    resetPasswordVerifying: 'Verificando el enlace...',
    resetLinkInvalid: 'Este enlace de restablecimiento no es válido o ha expirado. Solicita uno nuevo.',

    profileTitle: 'Mi perfil',
    personalInfo: 'Información personal',
    usernameFieldLabel: 'Nombre de usuario',
    emailFieldLabel: 'Correo electrónico',
    changePasswordTitle: 'Cambiar contraseña',
    currentPasswordLabel: 'Contraseña actual',
    newPasswordFieldLabel: 'Nueva contraseña',
    confirmPasswordLabel: 'Confirmar contraseña',
    savePersonalInfo: 'Guardar información',
    savePasswordButton: 'Actualizar contraseña',
    passwordUpdated: '¡Contraseña actualizada!',
    infoUpdated: '¡Información actualizada!',
    errorPasswordMismatch: 'Las contraseñas no coinciden.',
    profileMenuItem: 'Perfil',

    historyTitle: 'Historial',
    historyLoans: 'Préstamos',
    historyDebts: 'Deudas',

    statusLabel: 'Estado',
    statusEnCours: 'En curso',
    statusEnAttenteValidation: 'Pendiente de validación',
    statusPaye: 'Pagado',
    changeStatus: 'Cambiar estado',
    overdueNotifTitle: 'Vencido',
    overdueNotifBody: '{name} ha superado su fecha de vencimiento.',

    errorDueDateRequired: 'La fecha de vencimiento es obligatoria.',

    loginTitle: 'Iniciar sesión',
    loginSubtitle: 'Bienvenido de nuevo',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    emailOrUsernameLabel: 'Correo electrónico o nombre de usuario',
    emailOrUsernamePlaceholder: 'tu@ejemplo.com o nombre de usuario',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: '••••••••',
    loginButton: 'Iniciar sesión',
    noAccount: '¿No tienes cuenta?',
    createAccount: 'Crear una cuenta',
    signupTitle: 'Crear una cuenta',
    signupSubtitle: 'Únete en unos segundos',
    usernameLabel: 'Nombre de usuario',
    usernamePlaceholder: 'ej: Poketo_user',
    signupButton: 'Registrarse',
    haveAccount: '¿Ya tienes una cuenta?',
    backToLogin: 'Iniciar sesión',
    forgotPassword: '¿Olvidaste tu contraseña?',
    forgotPasswordTitle: 'Contraseña olvidada',
    forgotPasswordSubtitle: 'Introduce tu correo para recibir un enlace de restablecimiento.',
    sendResetLink: 'Enviar enlace',
    resetLinkSent: '¡Correo enviado! Revisa tu bandeja de entrada.',
    newPasswordLabel: 'Nueva contraseña',
    resetPasswordTitle: 'Restablecer contraseña',
    resetPasswordSubtitle: 'Elige una nueva contraseña para tu cuenta.',
    resetPasswordButton: 'Restablecer',
    resetPasswordSuccess: '¡Contraseña actualizada! Ya puedes iniciar sesión.',
    verifyEmailTitle: 'Confirma tu cuenta',
    verifyEmailMessage: 'Se envió un correo de confirmación a {email}. Haz clic en el enlace para activar tu cuenta y vuelve a iniciar sesión.',

    balanceGlobal: 'Balance general',
    onMeDoit: 'Me deben',
    jeDois: 'Debo',
    recentOps: 'Actividad reciente',
    results: 'Resultados',
    searchPlaceholder: 'Buscar un nombre, una nota...',
    noOpsYet: 'Aún no hay operaciones. Añade la primera con el botón de abajo.',
    noResults: 'Ninguna operación coincide con tu búsqueda.',
    loan: 'Préstamo',
    debt: 'Deuda',
    dueToday: 'Vence hoy',
    overdue: 'Vencido',
    dueInDays: 'Vence en {n} d',
    addButton: 'Añadir',

    addTitle: 'Nueva operación',
    selectType: 'Selecciona el tipo',
    iLent: 'Presté',
    iBorrowed: 'Pedí prestado',
    amount: 'Monto',
    contactLabel: '¿A quién? / ¿De quién?',
    contactPlaceholder: 'Escribe un nombre... (ej: Paul)',
    dueDateLabel: 'Fecha de vencimiento',
    dueDateHint: 'Recordatorio automático 5 días antes, y aviso el mismo día.',
    optionsLabel: 'Opciones (opcional)',
    addNote: 'Añadir una nota / explicación',
    notePlaceholder: 'ej: prestado para el restaurante',
    addPhoto: 'Tomar / Añadir una foto',
    changePhoto: 'Cambiar foto',
    takePhoto: 'Tomar una foto',
    chooseFromLibrary: 'Elegir de la galería',
    removePhoto: 'Eliminar foto',
    validate: 'Confirmar',
    removeDate: 'Quitar',
    selectDate: 'Seleccionar una fecha',

    detailTitle: 'Detalle de la operación',
    editTitle: 'Editar',
    addedOn: 'Añadido el',
    save: 'Guardar',
    cancel: 'Cancelar',
    deleteConfirmTitle: '¿Eliminar esta operación?',
    deleteConfirmMessage: 'Esta acción es definitiva y no se puede deshacer.',
    deleteConfirmYes: 'Eliminar',
    deleteConfirmNo: 'Cancelar',
    notFound: 'Operación no encontrada.',

    settingsTitle: 'Ajustes',
    currencyLabel: 'Moneda',
    languageLabel: 'Idioma',
    systemLanguage: 'Automático (sistema)',
    logout: 'Cerrar sesión',

    errorFillFields: 'Por favor completa todos los campos.',
    errorInvalidEmail: 'Correo electrónico inválido.',
    errorPasswordShort: 'La contraseña debe tener al menos 6 caracteres.',
    errorInvalidAmount: 'Por favor introduce un monto válido.',
    errorNameRequired: 'Por favor introduce un nombre.',
    errorGeneric: 'Ocurrió un error, inténtalo de nuevo.',
    errorPhotoPermission: 'Se requiere acceso a las fotos.',
    errorCameraPermission: 'Se requiere acceso a la cámara.',
    errorUserNotFound: 'Usuario no encontrado.',
  },

  de: {
    appName: 'Poketo',
    resetPasswordVerifying: 'Link wird überprüft...',
    resetLinkInvalid: 'Dieser Link zum Zurücksetzen ist ungültig oder abgelaufen. Fordere einen neuen an.',

    profileTitle: 'Mein Profil',
    personalInfo: 'Persönliche Informationen',
    usernameFieldLabel: 'Benutzername',
    emailFieldLabel: 'E-Mail',
    changePasswordTitle: 'Passwort ändern',
    currentPasswordLabel: 'Aktuelles Passwort',
    newPasswordFieldLabel: 'Neues Passwort',
    confirmPasswordLabel: 'Passwort bestätigen',
    savePersonalInfo: 'Informationen speichern',
    savePasswordButton: 'Passwort aktualisieren',
    passwordUpdated: 'Passwort aktualisiert!',
    infoUpdated: 'Informationen aktualisiert!',
    errorPasswordMismatch: 'Die Passwörter stimmen nicht überein.',
    profileMenuItem: 'Profil',

    historyTitle: 'Verlauf',
    historyLoans: 'Verliehen',
    historyDebts: 'Schulden',

    statusLabel: 'Status',
    statusEnCours: 'In Bearbeitung',
    statusEnAttenteValidation: 'Wartet auf Bestätigung',
    statusPaye: 'Bezahlt',
    changeStatus: 'Status ändern',
    overdueNotifTitle: 'Überfällig',
    overdueNotifBody: '{name} hat das Fälligkeitsdatum überschritten.',

    errorDueDateRequired: 'Das Fälligkeitsdatum ist erforderlich.',

    loginTitle: 'Anmelden',
    loginSubtitle: 'Willkommen zurück',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'du@beispiel.com',
    emailOrUsernameLabel: 'E-Mail oder Benutzername',
    emailOrUsernamePlaceholder: 'du@beispiel.com oder Benutzername',
    passwordLabel: 'Passwort',
    passwordPlaceholder: '••••••••',
    loginButton: 'Anmelden',
    noAccount: 'Noch kein Konto?',
    createAccount: 'Konto erstellen',
    signupTitle: 'Konto erstellen',
    signupSubtitle: 'In wenigen Sekunden dabei sein',
    usernameLabel: 'Benutzername',
    usernamePlaceholder: 'z. B. Poketo_user',
    signupButton: 'Registrieren',
    haveAccount: 'Schon ein Konto?',
    backToLogin: 'Anmelden',
    forgotPassword: 'Passwort vergessen?',
    forgotPasswordTitle: 'Passwort vergessen',
    forgotPasswordSubtitle: 'Gib deine E-Mail ein, um einen Link zum Zurücksetzen zu erhalten.',
    sendResetLink: 'Link senden',
    resetLinkSent: 'E-Mail gesendet! Überprüfe dein Postfach.',
    newPasswordLabel: 'Neues Passwort',
    resetPasswordTitle: 'Passwort zurücksetzen',
    resetPasswordSubtitle: 'Wähle ein neues Passwort für dein Konto.',
    resetPasswordButton: 'Zurücksetzen',
    resetPasswordSuccess: 'Passwort aktualisiert! Du kannst dich jetzt anmelden.',
    verifyEmailTitle: 'Bestätige dein Konto',
    verifyEmailMessage: 'Eine Bestätigungs-E-Mail wurde an {email} gesendet. Klicke auf den Link, um dein Konto zu aktivieren, und melde dich anschließend an.',

    balanceGlobal: 'Gesamtsaldo',
    onMeDoit: 'Man schuldet mir',
    jeDois: 'Ich schulde',
    recentOps: 'Letzte Aktivitäten',
    results: 'Ergebnisse',
    searchPlaceholder: 'Namen oder Notiz suchen...',
    noOpsYet: 'Noch keine Transaktionen. Füge deine erste mit dem Button unten hinzu.',
    noResults: 'Keine Transaktion entspricht deiner Suche.',
    loan: 'Kredit',
    debt: 'Schuld',
    dueToday: 'Heute fällig',
    overdue: 'Überfällig',
    dueInDays: 'Fällig in {n} T',
    addButton: 'Hinzufügen',

    addTitle: 'Neue Transaktion',
    selectType: 'Typ auswählen',
    iLent: 'Ich habe verliehen',
    iBorrowed: 'Ich habe geliehen',
    amount: 'Betrag',
    contactLabel: 'An wen? / Von wem?',
    contactPlaceholder: 'Name eingeben... (z. B. Paul)',
    dueDateLabel: 'Fälligkeitsdatum',
    dueDateHint: 'Automatische Erinnerung 5 Tage vorher und Warnung am selben Tag.',
    optionsLabel: 'Optionen (optional)',
    addNote: 'Notiz / Erklärung hinzufügen',
    notePlaceholder: 'z. B. für das Restaurant geliehen',
    addPhoto: 'Foto aufnehmen / hinzufügen',
    changePhoto: 'Foto ändern',
    takePhoto: 'Foto aufnehmen',
    chooseFromLibrary: 'Aus Galerie wählen',
    removePhoto: 'Foto entfernen',
    validate: 'Bestätigen',
    removeDate: 'Entfernen',
    selectDate: 'Datum auswählen',

    detailTitle: 'Transaktionsdetails',
    editTitle: 'Bearbeiten',
    addedOn: 'Hinzugefügt am',
    save: 'Speichern',
    cancel: 'Abbrechen',
    deleteConfirmTitle: 'Diese Transaktion löschen?',
    deleteConfirmMessage: 'Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden.',
    deleteConfirmYes: 'Löschen',
    deleteConfirmNo: 'Abbrechen',
    notFound: 'Transaktion nicht gefunden.',

    settingsTitle: 'Einstellungen',
    currencyLabel: 'Währung',
    languageLabel: 'Sprache',
    systemLanguage: 'Automatisch (System)',
    logout: 'Abmelden',

    errorFillFields: 'Bitte fülle alle Felder aus.',
    errorInvalidEmail: 'Ungültige E-Mail-Adresse.',
    errorPasswordShort: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    errorInvalidAmount: 'Bitte gib einen gültigen Betrag ein.',
    errorNameRequired: 'Bitte gib einen Namen ein.',
    errorGeneric: 'Ein Fehler ist aufgetreten, versuche es erneut.',
    errorPhotoPermission: 'Zugriff auf Fotos ist erforderlich.',
    errorCameraPermission: 'Zugriff auf die Kamera ist erforderlich.',
    errorUserNotFound: 'Benutzer nicht gefunden.',
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