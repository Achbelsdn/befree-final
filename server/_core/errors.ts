/**
 * Error Codes and AppError Class
 * ==============================
 * Codes d'erreur standardisés pour toute l'application
 */

// Codes d'erreur par catégorie
export const ErrorCodes = {
  // Authentification (1xxx)
  AUTH_FAILED: { code: 1001, message: 'Authentification échouée', httpStatus: 401 },
  AUTH_INVALID_CREDENTIALS: { code: 1002, message: 'Email ou mot de passe incorrect', httpStatus: 401 },
  AUTH_TOKEN_EXPIRED: { code: 1003, message: 'Session expirée, veuillez vous reconnecter', httpStatus: 401 },
  AUTH_TOKEN_INVALID: { code: 1004, message: 'Token invalide', httpStatus: 401 },
  AUTH_UNAUTHORIZED: { code: 1005, message: 'Non autorisé', httpStatus: 403 },
  AUTH_FORBIDDEN: { code: 1006, message: 'Accès interdit', httpStatus: 403 },
  AUTH_USER_BANNED: { code: 1007, message: 'Compte suspendu', httpStatus: 403 },
  AUTH_EMAIL_EXISTS: { code: 1008, message: 'Cet email est déjà utilisé', httpStatus: 409 },
  AUTH_WEAK_PASSWORD: { code: 1009, message: 'Mot de passe trop faible', httpStatus: 400 },

  // Utilisateur (2xxx)
  USER_NOT_FOUND: { code: 2001, message: 'Utilisateur non trouvé', httpStatus: 404 },
  USER_PROFILE_INCOMPLETE: { code: 2002, message: 'Profil incomplet', httpStatus: 400 },
  USER_NOT_SELLER: { code: 2003, message: 'Vous devez être vendeur pour effectuer cette action', httpStatus: 403 },
  USER_KYC_REQUIRED: { code: 2004, message: 'Vérification KYC requise', httpStatus: 403 },
  USER_KYC_PENDING: { code: 2005, message: 'Vérification KYC en cours', httpStatus: 403 },
  USER_KYC_REJECTED: { code: 2006, message: 'Vérification KYC rejetée', httpStatus: 403 },

  // Base de données (3xxx)
  DB_UNAVAILABLE: { code: 3001, message: 'Base de données indisponible', httpStatus: 503 },
  DB_QUERY_FAILED: { code: 3002, message: 'Erreur de requête', httpStatus: 500 },
  DB_DUPLICATE_ENTRY: { code: 3003, message: 'Entrée en double', httpStatus: 409 },
  DB_CONSTRAINT_VIOLATION: { code: 3004, message: 'Violation de contrainte', httpStatus: 400 },

  // Wallet et Transactions (4xxx)
  INSUFFICIENT_BALANCE: { code: 4001, message: 'Solde insuffisant', httpStatus: 400 },
  WALLET_NOT_FOUND: { code: 4002, message: 'Wallet non trouvé', httpStatus: 404 },
  TRANSACTION_FAILED: { code: 4003, message: 'Transaction échouée', httpStatus: 500 },
  TRANSACTION_NOT_FOUND: { code: 4004, message: 'Transaction non trouvée', httpStatus: 404 },
  INVALID_AMOUNT: { code: 4005, message: 'Montant invalide', httpStatus: 400 },
  AMOUNT_TOO_LOW: { code: 4006, message: 'Montant trop bas', httpStatus: 400 },
  AMOUNT_TOO_HIGH: { code: 4007, message: 'Montant trop élevé', httpStatus: 400 },
  WITHDRAWAL_LIMIT_EXCEEDED: { code: 4008, message: 'Limite de retrait dépassée', httpStatus: 400 },

  // Escrow (5xxx)
  ESCROW_NOT_FOUND: { code: 5001, message: 'Escrow non trouvé', httpStatus: 404 },
  ESCROW_ALREADY_RELEASED: { code: 5002, message: 'Fonds déjà libérés', httpStatus: 400 },
  ESCROW_ALREADY_REFUNDED: { code: 5003, message: 'Déjà remboursé', httpStatus: 400 },
  ESCROW_INVALID_STATUS: { code: 5004, message: 'Statut escrow invalide', httpStatus: 400 },
  ESCROW_RELEASE_FAILED: { code: 5005, message: 'Échec de libération des fonds', httpStatus: 500 },
  ESCROW_REFUND_FAILED: { code: 5006, message: 'Échec du remboursement', httpStatus: 500 },

  // Commandes (6xxx)
  ORDER_NOT_FOUND: { code: 6001, message: 'Commande non trouvée', httpStatus: 404 },
  ORDER_INVALID_STATUS: { code: 6002, message: 'Statut de commande invalide', httpStatus: 400 },
  ORDER_ALREADY_PAID: { code: 6003, message: 'Commande déjà payée', httpStatus: 400 },
  ORDER_NOT_PAID: { code: 6004, message: 'Commande non payée', httpStatus: 400 },
  ORDER_CANNOT_CANCEL: { code: 6005, message: 'Impossible d\'annuler cette commande', httpStatus: 400 },
  ORDER_DELIVERY_REQUIRED: { code: 6006, message: 'Livraison requise avant cette action', httpStatus: 400 },

  // Services (7xxx)
  SERVICE_NOT_FOUND: { code: 7001, message: 'Service non trouvé', httpStatus: 404 },
  SERVICE_INACTIVE: { code: 7002, message: 'Service inactif', httpStatus: 400 },
  SERVICE_LIMIT_REACHED: { code: 7003, message: 'Limite de services atteinte', httpStatus: 400 },
  SERVICE_INVALID_PRICE: { code: 7004, message: 'Prix invalide', httpStatus: 400 },

  // Projets (8xxx)
  PROJECT_NOT_FOUND: { code: 8001, message: 'Projet non trouvé', httpStatus: 404 },
  PROJECT_CLOSED: { code: 8002, message: 'Projet fermé', httpStatus: 400 },
  PROJECT_ALREADY_APPLIED: { code: 8003, message: 'Vous avez déjà postulé', httpStatus: 400 },
  APPLICATION_NOT_FOUND: { code: 8004, message: 'Candidature non trouvée', httpStatus: 404 },

  // Disputes (9xxx)
  DISPUTE_NOT_FOUND: { code: 9001, message: 'Litige non trouvé', httpStatus: 404 },
  DISPUTE_ALREADY_OPEN: { code: 9002, message: 'Un litige est déjà ouvert', httpStatus: 400 },
  DISPUTE_ALREADY_RESOLVED: { code: 9003, message: 'Litige déjà résolu', httpStatus: 400 },
  DISPUTE_INVALID_RESOLUTION: { code: 9004, message: 'Résolution invalide', httpStatus: 400 },

  // KYC (10xxx)
  KYC_DOCUMENT_NOT_FOUND: { code: 10001, message: 'Document KYC non trouvé', httpStatus: 404 },
  KYC_INVALID_DOCUMENT: { code: 10002, message: 'Document invalide', httpStatus: 400 },
  KYC_ALREADY_VERIFIED: { code: 10003, message: 'Déjà vérifié', httpStatus: 400 },
  KYC_UPLOAD_FAILED: { code: 10004, message: 'Échec de l\'upload', httpStatus: 500 },

  // Validation (11xxx)
  VALIDATION_FAILED: { code: 11001, message: 'Validation échouée', httpStatus: 400 },
  INVALID_INPUT: { code: 11002, message: 'Données invalides', httpStatus: 400 },
  MISSING_REQUIRED_FIELD: { code: 11003, message: 'Champ requis manquant', httpStatus: 400 },
  INVALID_FORMAT: { code: 11004, message: 'Format invalide', httpStatus: 400 },

  // Rate Limiting (12xxx)
  RATE_LIMIT_EXCEEDED: { code: 12001, message: 'Trop de requêtes, veuillez patienter', httpStatus: 429 },

  // Général (99xxx)
  INTERNAL_ERROR: { code: 99001, message: 'Erreur interne du serveur', httpStatus: 500 },
  NOT_IMPLEMENTED: { code: 99002, message: 'Fonctionnalité non implémentée', httpStatus: 501 },
  SERVICE_UNAVAILABLE: { code: 99003, message: 'Service temporairement indisponible', httpStatus: 503 },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCodes;

/**
 * Classe d'erreur personnalisée pour l'application
 */
export class AppError extends Error {
  public readonly code: number;
  public readonly httpStatus: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    errorKey: ErrorCodeKey,
    customMessage?: string,
    details?: Record<string, unknown>
  ) {
    const errorDef = ErrorCodes[errorKey];
    super(customMessage || errorDef.message);
    
    this.name = 'AppError';
    this.code = errorDef.code;
    this.httpStatus = errorDef.httpStatus;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Distingue les erreurs opérationnelles des bugs

    // Capture la stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Fonction helper pour créer une AppError
 */
export function createError(
  errorKey: ErrorCodeKey,
  customMessage?: string,
  details?: Record<string, unknown>
): AppError {
  return new AppError(errorKey, customMessage, details);
}

/**
 * Vérifie si une erreur est une AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convertit une erreur inconnue en AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError('INTERNAL_ERROR', error.message);
  }
  
  return new AppError('INTERNAL_ERROR', String(error));
}

export default AppError;
