/**
 * Logger Configuration - Winston
 * ==============================
 * Système de logging structuré pour production
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Format personnalisé pour le développement
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Format JSON pour la production
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuration des transports
const transports: winston.transport[] = [];

// Console transport
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  })
);

// File transports pour production
if (process.env.NODE_ENV === 'production') {
  // Logs d'erreur
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: prodFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 14, // 14 jours de rétention
    })
  );

  // Logs combinés
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: prodFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 14,
    })
  );

  // Logs d'audit pour les transactions
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      format: prodFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 30, // 30 jours pour l'audit
    })
  );
}

// Créer le logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports,
  exitOnError: false,
});

// Fonctions de logging spécialisées
export const logAuth = (action: string, data: Record<string, unknown>) => {
  logger.info(`[AUTH] ${action}`, { category: 'auth', ...data });
};

export const logTransaction = (action: string, data: Record<string, unknown>) => {
  logger.info(`[TRANSACTION] ${action}`, { category: 'transaction', ...data });
};

export const logEscrow = (action: string, data: Record<string, unknown>) => {
  logger.info(`[ESCROW] ${action}`, { category: 'escrow', ...data });
};

export const logOrder = (action: string, data: Record<string, unknown>) => {
  logger.info(`[ORDER] ${action}`, { category: 'order', ...data });
};

export const logKYC = (action: string, data: Record<string, unknown>) => {
  logger.info(`[KYC] ${action}`, { category: 'kyc', ...data });
};

export const logDispute = (action: string, data: Record<string, unknown>) => {
  logger.info(`[DISPUTE] ${action}`, { category: 'dispute', ...data });
};

export const logWallet = (action: string, data: Record<string, unknown>) => {
  logger.info(`[WALLET] ${action}`, { category: 'wallet', ...data });
};

export const logNotification = (action: string, data: Record<string, unknown>) => {
  logger.info(`[NOTIFICATION] ${action}`, { category: 'notification', ...data });
};

export const logSocket = (action: string, data: Record<string, unknown>) => {
  logger.debug(`[SOCKET] ${action}`, { category: 'socket', ...data });
};

export const logDB = (action: string, data: Record<string, unknown>) => {
  logger.debug(`[DB] ${action}`, { category: 'database', ...data });
};

export const logAPI = (action: string, data: Record<string, unknown>) => {
  logger.info(`[API] ${action}`, { category: 'api', ...data });
};

export const logError = (action: string, error: Error | unknown, data?: Record<string, unknown>) => {
  const errorData = error instanceof Error 
    ? { message: error.message, stack: error.stack }
    : { error: String(error) };
  logger.error(`[ERROR] ${action}`, { category: 'error', ...errorData, ...data });
};

export const logSecurity = (action: string, data: Record<string, unknown>) => {
  logger.warn(`[SECURITY] ${action}`, { category: 'security', ...data });
};

export default logger;
