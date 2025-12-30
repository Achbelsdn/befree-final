/**
 * Validation Schemas - Zod
 * ========================
 * Schémas de validation réutilisables pour toute l'application
 */

import { z } from 'zod';

// ==================== MONTANTS FINANCIERS ====================

/**
 * Schéma pour les montants en XOF (Franc CFA)
 * - Minimum: 100 XOF
 * - Maximum: 10,000,000 XOF
 * - Doit être un nombre entier (pas de centimes en XOF)
 */
export const amountXOFSchema = z
  .number()
  .int('Le montant doit être un nombre entier')
  .min(100, 'Le montant minimum est de 100 XOF')
  .max(10000000, 'Le montant maximum est de 10,000,000 XOF')
  .positive('Le montant doit être positif');

/**
 * Schéma pour les prix de services
 * - Minimum: 500 XOF
 * - Maximum: 5,000,000 XOF
 */
export const servicePriceSchema = z
  .number()
  .int('Le prix doit être un nombre entier')
  .min(500, 'Le prix minimum est de 500 XOF')
  .max(5000000, 'Le prix maximum est de 5,000,000 XOF')
  .positive('Le prix doit être positif');

/**
 * Schéma pour les budgets de projets
 * - Minimum: 1,000 XOF
 * - Maximum: 50,000,000 XOF
 */
export const projectBudgetSchema = z
  .number()
  .int('Le budget doit être un nombre entier')
  .min(1000, 'Le budget minimum est de 1,000 XOF')
  .max(50000000, 'Le budget maximum est de 50,000,000 XOF')
  .positive('Le budget doit être positif');

/**
 * Schéma pour les montants de retrait
 * - Minimum: 1,000 XOF
 * - Maximum: 2,000,000 XOF par transaction
 */
export const withdrawalAmountSchema = z
  .number()
  .int('Le montant doit être un nombre entier')
  .min(1000, 'Le montant minimum de retrait est de 1,000 XOF')
  .max(2000000, 'Le montant maximum de retrait est de 2,000,000 XOF')
  .positive('Le montant doit être positif');

/**
 * Schéma pour les pourcentages (frais, commission)
 * - Entre 0 et 100
 * - Précision: 2 décimales
 */
export const percentageSchema = z
  .number()
  .min(0, 'Le pourcentage ne peut pas être négatif')
  .max(100, 'Le pourcentage ne peut pas dépasser 100%')
  .transform(val => Math.round(val * 100) / 100); // 2 décimales

/**
 * Convertit un string en montant validé
 */
export const stringToAmountSchema = z
  .string()
  .transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    if (isNaN(num)) throw new Error('Montant invalide');
    return Math.round(num);
  })
  .pipe(amountXOFSchema);

// ==================== DEVISE ====================

export const currencySchema = z.enum(['XOF', 'EUR', 'USD']).default('XOF');

// ==================== MÉTHODES DE PAIEMENT ====================

export const paymentMethodSchema = z.enum([
  'mtn_momo',
  'moov_money',
  'celtiis_cash',
  'bank_transfer',
  'wallet',
]);

// ==================== UTILISATEUR ====================

export const emailSchema = z
  .string()
  .email('Email invalide')
  .min(5, 'Email trop court')
  .max(320, 'Email trop long')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe est trop long')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

export const nameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom est trop long')
  .trim();

export const phoneSchema = z
  .string()
  .regex(/^(\+229|00229)?[0-9]{8}$/, 'Numéro de téléphone béninois invalide')
  .transform(val => {
    // Normaliser au format +229XXXXXXXX
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('229')) return `+${digits}`;
    return `+229${digits.slice(-8)}`;
  });

export const userTypeSchema = z.enum(['client', 'freelance']);

export const userRoleSchema = z.enum(['user', 'moderator', 'admin', 'superadmin']);

// ==================== SERVICE ====================

export const serviceTitleSchema = z
  .string()
  .min(10, 'Le titre doit contenir au moins 10 caractères')
  .max(100, 'Le titre ne peut pas dépasser 100 caractères')
  .trim();

export const serviceDescriptionSchema = z
  .string()
  .min(50, 'La description doit contenir au moins 50 caractères')
  .max(5000, 'La description ne peut pas dépasser 5000 caractères')
  .trim();

export const deliveryTimeSchema = z
  .number()
  .int()
  .min(1, 'Le délai minimum est de 1 jour')
  .max(90, 'Le délai maximum est de 90 jours');

export const serviceStatusSchema = z.enum(['draft', 'pending', 'active', 'paused', 'rejected']);

// ==================== COMMANDE ====================

export const orderStatusSchema = z.enum([
  'pending',
  'paid',
  'in_progress',
  'delivered',
  'revision_requested',
  'completed',
  'cancelled',
  'disputed',
]);

export const paymentStatusSchema = z.enum(['pending', 'paid', 'released', 'refunded']);

// ==================== PROJET ====================

export const projectTitleSchema = z
  .string()
  .min(10, 'Le titre doit contenir au moins 10 caractères')
  .max(150, 'Le titre ne peut pas dépasser 150 caractères')
  .trim();

export const projectDescriptionSchema = z
  .string()
  .min(100, 'La description doit contenir au moins 100 caractères')
  .max(10000, 'La description ne peut pas dépasser 10000 caractères')
  .trim();

export const projectStatusSchema = z.enum(['open', 'in_progress', 'completed', 'cancelled']);

// ==================== KYC ====================

export const kycDocumentTypeSchema = z.enum([
  'id_card',
  'passport',
  'driver_license',
  'residence_proof',
  'selfie',
]);

export const kycStatusSchema = z.enum(['none', 'pending', 'approved', 'rejected']);

// ==================== DISPUTE ====================

export const disputeStatusSchema = z.enum(['open', 'under_review', 'resolved', 'closed']);

export const disputeReasonSchema = z
  .string()
  .min(20, 'La raison doit contenir au moins 20 caractères')
  .max(2000, 'La raison ne peut pas dépasser 2000 caractères')
  .trim();

// ==================== PAGINATION ====================

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// ==================== HELPERS ====================

/**
 * Valide et parse un montant depuis n'importe quel format
 */
export function parseAmount(value: string | number): number {
  if (typeof value === 'number') {
    return Math.round(value);
  }
  const num = parseFloat(value.replace(/[^\d.-]/g, ''));
  if (isNaN(num)) {
    throw new Error('Montant invalide');
  }
  return Math.round(num);
}

/**
 * Formate un montant pour l'affichage
 */
export function formatAmount(amount: number, currency: string = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calcule les frais de plateforme
 */
export function calculatePlatformFee(amount: number, feePercent: number = 10): {
  platformFee: number;
  sellerAmount: number;
} {
  const platformFee = Math.round(amount * (feePercent / 100));
  const sellerAmount = amount - platformFee;
  return { platformFee, sellerAmount };
}

export default {
  amountXOFSchema,
  servicePriceSchema,
  projectBudgetSchema,
  withdrawalAmountSchema,
  percentageSchema,
  stringToAmountSchema,
  currencySchema,
  paymentMethodSchema,
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
  userTypeSchema,
  userRoleSchema,
  serviceTitleSchema,
  serviceDescriptionSchema,
  deliveryTimeSchema,
  serviceStatusSchema,
  orderStatusSchema,
  paymentStatusSchema,
  projectTitleSchema,
  projectDescriptionSchema,
  projectStatusSchema,
  kycDocumentTypeSchema,
  kycStatusSchema,
  disputeStatusSchema,
  disputeReasonSchema,
  paginationSchema,
  parseAmount,
  formatAmount,
  calculatePlatformFee,
};
