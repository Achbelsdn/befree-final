/**
 * Rate Limiter Configuration
 * ==========================
 * Protection contre les attaques DDoS et brute-force
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Configuration des limites par type d'endpoint
const RATE_LIMITS = {
  // Authentification - très restrictif pour éviter brute-force
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par fenêtre
    message: {
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
      retryAfter: 15 * 60,
    },
  },
  // API générale
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requêtes par minute
    message: {
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requêtes. Veuillez patienter.',
      retryAfter: 60,
    },
  },
  // Création de contenu (services, projets)
  create: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // 20 créations par heure
    message: {
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Limite de création atteinte. Réessayez dans 1 heure.',
      retryAfter: 60 * 60,
    },
  },
  // Transactions financières
  financial: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 transactions par heure
    message: {
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Limite de transactions atteinte. Réessayez dans 1 heure.',
      retryAfter: 60 * 60,
    },
  },
  // Upload de fichiers
  upload: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 50, // 50 uploads par heure
    message: {
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Limite d\'upload atteinte. Réessayez dans 1 heure.',
      retryAfter: 60 * 60,
    },
  },
};

// Fonction pour obtenir l'IP du client
const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

// Rate limiter pour l'authentification
export const authLimiter = rateLimit({
  ...RATE_LIMITS.auth,
  keyGenerator: getClientIP,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[RateLimit] Auth limit exceeded for IP: ${getClientIP(req)}`);
    res.status(429).json(RATE_LIMITS.auth.message);
  },
});

// Rate limiter pour l'API générale
export const apiLimiter = rateLimit({
  ...RATE_LIMITS.api,
  keyGenerator: getClientIP,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting pour les health checks
    return req.path === '/health' || req.path === '/api/health';
  },
  handler: (req: Request, res: Response) => {
    console.warn(`[RateLimit] API limit exceeded for IP: ${getClientIP(req)}`);
    res.status(429).json(RATE_LIMITS.api.message);
  },
});

// Rate limiter pour la création de contenu
export const createLimiter = rateLimit({
  ...RATE_LIMITS.create,
  keyGenerator: getClientIP,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[RateLimit] Create limit exceeded for IP: ${getClientIP(req)}`);
    res.status(429).json(RATE_LIMITS.create.message);
  },
});

// Rate limiter pour les transactions financières
export const financialLimiter = rateLimit({
  ...RATE_LIMITS.financial,
  keyGenerator: getClientIP,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[RateLimit] Financial limit exceeded for IP: ${getClientIP(req)}`);
    res.status(429).json(RATE_LIMITS.financial.message);
  },
});

// Rate limiter pour les uploads
export const uploadLimiter = rateLimit({
  ...RATE_LIMITS.upload,
  keyGenerator: getClientIP,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[RateLimit] Upload limit exceeded for IP: ${getClientIP(req)}`);
    res.status(429).json(RATE_LIMITS.upload.message);
  },
});

// Rate limiter personnalisé basé sur l'utilisateur authentifié
export const createUserBasedLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator: (req: Request) => {
      // Utiliser l'ID utilisateur si disponible, sinon l'IP
      const userId = (req as any).userId;
      return userId ? `user:${userId}` : getClientIP(req);
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: options.message,
      });
    },
  });
};

export default {
  authLimiter,
  apiLimiter,
  createLimiter,
  financialLimiter,
  uploadLimiter,
  createUserBasedLimiter,
};
