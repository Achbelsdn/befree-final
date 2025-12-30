/**
 * Health Check Endpoint
 * =====================
 * Vérifie l'état de santé de l'application
 */

import { Request, Response } from 'express';
import { getDb } from '../db';
import logger from './logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      used: number;
      total: number;
      percentage: number;
    };
  };
}

const startTime = Date.now();

/**
 * Vérifie la connexion à la base de données
 */
async function checkDatabase(): Promise<{ status: 'up' | 'down'; latency?: number; error?: string }> {
  const start = Date.now();
  try {
    const db = await getDb();
    if (!db) {
      return { status: 'down', error: 'Database not configured' };
    }
    
    // Exécuter une requête simple pour vérifier la connexion
    await db.execute('SELECT 1');
    const latency = Date.now() - start;
    
    return { status: 'up', latency };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[Health] Database check failed', { error: errorMessage });
    return { status: 'down', error: errorMessage };
  }
}

/**
 * Vérifie l'utilisation de la mémoire
 */
function checkMemory(): { status: 'ok' | 'warning' | 'critical'; used: number; total: number; percentage: number } {
  const memUsage = process.memoryUsage();
  const totalMemory = require('os').totalmem();
  const usedMemory = memUsage.heapUsed;
  const percentage = (usedMemory / totalMemory) * 100;
  
  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (percentage > 90) {
    status = 'critical';
  } else if (percentage > 70) {
    status = 'warning';
  }
  
  return {
    status,
    used: Math.round(usedMemory / 1024 / 1024), // MB
    total: Math.round(totalMemory / 1024 / 1024), // MB
    percentage: Math.round(percentage * 100) / 100,
  };
}

/**
 * Handler pour le health check endpoint
 */
export async function healthCheckHandler(req: Request, res: Response): Promise<void> {
  const dbCheck = await checkDatabase();
  const memoryCheck = checkMemory();
  
  // Déterminer le statut global
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (dbCheck.status === 'down') {
    overallStatus = 'unhealthy';
  } else if (memoryCheck.status === 'critical') {
    overallStatus = 'unhealthy';
  } else if (memoryCheck.status === 'warning') {
    overallStatus = 'degraded';
  }
  
  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000), // secondes
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: dbCheck,
      memory: memoryCheck,
    },
  };
  
  // Log si dégradé ou unhealthy
  if (overallStatus !== 'healthy') {
    logger.warn('[Health] System health check', { status: overallStatus, checks: healthStatus.checks });
  }
  
  // Retourner le statut HTTP approprié
  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  res.status(httpStatus).json(healthStatus);
}

/**
 * Handler simplifié pour les load balancers
 */
export async function livenessHandler(req: Request, res: Response): Promise<void> {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
}

/**
 * Handler pour vérifier si l'app est prête à recevoir du trafic
 */
export async function readinessHandler(req: Request, res: Response): Promise<void> {
  const dbCheck = await checkDatabase();
  
  if (dbCheck.status === 'up') {
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: 'not_ready', reason: 'database_unavailable', timestamp: new Date().toISOString() });
  }
}

export default {
  healthCheckHandler,
  livenessHandler,
  readinessHandler,
};
