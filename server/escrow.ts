/**
 * ORBIT - Escrow System
 * ====================
 * Système de séquestre pour sécuriser les transactions entre clients et freelances.
 * 
 * Flux de paiement:
 * 1. Client crée une commande → Paiement capturé et mis en escrow (pendingBalance plateforme)
 * 2. Freelance travaille et livre → Status: "delivered"
 * 3. Client valide la livraison → Status: "completed" → Fonds libérés au freelance
 * 4. En cas de litige → Status: "disputed" → Médiation admin
 * 5. Remboursement possible si annulation avant livraison
 */

import * as db from "./db";
import { nanoid } from "nanoid";

// Configuration Escrow
export const ESCROW_CONFIG = {
  PLATFORM_FEE_PERCENT: 10, // Commission plateforme: 10%
  ESCROW_HOLD_DAYS: 3, // Jours de rétention après livraison avant libération auto
  MIN_ORDER_AMOUNT: 500, // Montant minimum de commande (XOF)
  REFUND_WINDOW_HOURS: 24, // Heures pour demander un remboursement après paiement
  AUTO_COMPLETE_DAYS: 7, // Jours après livraison pour validation automatique
  MIN_WITHDRAWAL_AMOUNT: 1000, // Montant minimum de retrait (XOF)
  MAX_WITHDRAWAL_AMOUNT: 5000000, // Montant maximum de retrait (XOF)
};

export interface EscrowTransaction {
  orderId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  currency: string;
  platformFee: number;
  sellerAmount: number;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  createdAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  externalReference?: string;
}

/**
 * Initialise l'escrow lors de la création d'une commande
 * Les fonds sont bloqués jusqu'à validation du client
 */
export async function initializeEscrow(params: {
  orderId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference?: string;
}): Promise<{ success: boolean; escrowId?: string; error?: string }> {
  try {
    const { orderId, buyerId, sellerId, amount, currency, paymentMethod, paymentReference } = params;
    
    // Vérifier le montant minimum
    if (amount < ESCROW_CONFIG.MIN_ORDER_AMOUNT) {
      return { success: false, error: `Montant minimum: ${ESCROW_CONFIG.MIN_ORDER_AMOUNT} ${currency}` };
    }
    
    // Calculer les frais
    const platformFee = amount * (ESCROW_CONFIG.PLATFORM_FEE_PERCENT / 100);
    const sellerAmount = amount - platformFee;
    
    // Créer ou récupérer le wallet du vendeur
    const sellerWallet = await db.getOrCreateWallet(sellerId);
    if (!sellerWallet) {
      return { success: false, error: "Impossible de créer le wallet vendeur" };
    }
    
    // Mettre les fonds en attente (pendingBalance) pour le vendeur
    await db.updateWalletBalance(sellerId, sellerAmount, 'add', true); // true = pending
    
    // Créer la transaction escrow
    const escrowId = `ESC-${nanoid(12)}`;
    
    // Enregistrer la transaction de paiement (côté acheteur)
    const buyerWallet = await db.getOrCreateWallet(buyerId);
    if (buyerWallet) {
      await db.createTransaction({
        userId: buyerId,
        walletId: buyerWallet.id,
        type: 'payment',
        amount: amount.toString(),
        currency,
        status: 'completed',
        paymentMethod: paymentMethod as any,
        reference: escrowId,
        externalReference: paymentReference,
        description: `Paiement escrow pour commande #${orderId}`,
        orderId,
      });
    }
    
    // Enregistrer la transaction en attente (côté vendeur)
    await db.createTransaction({
      userId: sellerId,
      walletId: sellerWallet.id,
      type: 'earning',
      amount: sellerAmount.toString(),
      currency,
      status: 'pending', // En attente jusqu'à libération
      reference: `${escrowId}-SELLER`,
      description: `Paiement en attente pour commande #${orderId} (escrow)`,
      orderId,
    });
    
    // Mettre à jour le statut de paiement de la commande
    await db.updateOrderPaymentStatus(orderId, 'paid');
    
    // Notifier le vendeur
    await db.createNotification({
      userId: sellerId,
      type: 'payment',
      title: 'Paiement reçu en escrow',
      content: `Un paiement de ${sellerAmount} ${currency} est en attente pour la commande #${orderId}. Il sera libéré après validation du client.`,
      link: `/dashboard/orders`,
    });
    
    return { success: true, escrowId };
  } catch (error) {
    console.error('[Escrow] Initialize error:', error);
    return { success: false, error: 'Erreur lors de l\'initialisation de l\'escrow' };
  }
}

/**
 * Libère les fonds de l'escrow vers le vendeur
 * Appelé quand le client valide la livraison
 */
export async function releaseEscrow(params: {
  orderId: number;
  releasedBy: 'buyer' | 'admin' | 'auto';
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { orderId, releasedBy, reason } = params;
    
    // Récupérer la commande
    const order = await db.getOrderById(orderId);
    if (!order) {
      return { success: false, error: 'Commande non trouvée' };
    }
    
    if (order.paymentStatus === 'released') {
      return { success: false, error: 'Fonds déjà libérés' };
    }
    
    if (order.paymentStatus !== 'paid') {
      return { success: false, error: 'Paiement non effectué' };
    }
    
    const amount = parseFloat(order.price);
    const platformFee = amount * (ESCROW_CONFIG.PLATFORM_FEE_PERCENT / 100);
    const sellerAmount = amount - platformFee;
    
    // Transférer de pendingBalance vers balance
    await db.releasePendingBalance(order.sellerId, sellerAmount);
    
    // Mettre à jour la transaction en attente
    await db.updateTransactionStatusByOrder(orderId, order.sellerId, 'completed');
    
    // Mettre à jour le statut de paiement
    await db.updateOrderPaymentStatus(orderId, 'released');
    
    // Mettre à jour le statut de la commande si pas déjà fait
    if (order.status !== 'completed') {
      await db.updateOrderStatus(orderId, 'completed');
    }
    
    // Notifier le vendeur
    const releaseMessage = releasedBy === 'auto' 
      ? `Votre paiement de ${sellerAmount} ${order.currency} pour la commande #${orderId} a été libéré automatiquement après ${ESCROW_CONFIG.AUTO_COMPLETE_DAYS} jours.`
      : `Votre paiement de ${sellerAmount} ${order.currency} pour la commande #${orderId} a été libéré et ajouté à votre solde.`;
    
    await db.createNotification({
      userId: order.sellerId,
      type: 'payment',
      title: 'Paiement libéré !',
      content: releaseMessage,
      link: `/dashboard/wallet`,
    });
    
    // Notifier l'acheteur
    await db.createNotification({
      userId: order.buyerId,
      type: 'order',
      title: 'Commande terminée',
      content: `La commande #${orderId} est terminée. Merci pour votre confiance !`,
      link: `/dashboard/orders`,
    });
    
    console.log(`[Escrow] Released ${sellerAmount} ${order.currency} for order #${orderId} by ${releasedBy}${reason ? ` - Reason: ${reason}` : ''}`);
    
    return { success: true };
  } catch (error) {
    console.error('[Escrow] Release error:', error);
    return { success: false, error: 'Erreur lors de la libération des fonds' };
  }
}

/**
 * Rembourse l'acheteur (annulation ou litige résolu en faveur de l'acheteur)
 */
export async function refundEscrow(params: {
  orderId: number;
  reason: string;
  refundedBy: 'seller' | 'admin';
  partialAmount?: number; // Pour remboursement partiel
  initiateExternalRefund?: boolean; // Si true, initie un remboursement vers Mobile Money
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { orderId, reason, refundedBy, partialAmount, initiateExternalRefund } = params;
    
    const order = await db.getOrderById(orderId);
    if (!order) {
      return { success: false, error: 'Commande non trouvée' };
    }
    
    if (order.paymentStatus === 'refunded') {
      return { success: false, error: 'Déjà remboursé' };
    }
    
    if (order.paymentStatus === 'released') {
      return { success: false, error: 'Fonds déjà libérés, remboursement impossible' };
    }
    
    const amount = parseFloat(order.price);
    const platformFee = amount * (ESCROW_CONFIG.PLATFORM_FEE_PERCENT / 100);
    const sellerAmount = amount - platformFee;
    const refundAmount = partialAmount || amount;
    
    // Retirer du pendingBalance du vendeur
    await db.updateWalletBalance(order.sellerId, sellerAmount, 'subtract', true);
    
    // Créer une transaction de remboursement pour l'acheteur
    const buyerWallet = await db.getOrCreateWallet(order.buyerId);
    if (buyerWallet) {
      await db.createTransaction({
        userId: order.buyerId,
        walletId: buyerWallet.id,
        type: 'refund',
        amount: refundAmount.toString(),
        currency: order.currency,
        status: 'completed',
        reference: `REF-${nanoid(10)}`,
        description: `Remboursement commande #${orderId}: ${reason}`,
        orderId,
      });
      
      // Ajouter au solde de l'acheteur
      await db.updateWalletBalance(order.buyerId, refundAmount, 'add');
      
      // Si c'était un paiement externe (MTN/Moov/Celtiis), initier remboursement externe
      if (initiateExternalRefund && order.paymentMethod && ['mtn', 'moov', 'celtiis'].includes(order.paymentMethod)) {
        // TODO: Intégrer avec FedaPay pour remboursement externe
        console.log(`[Escrow] External refund requested for order #${orderId} via ${order.paymentMethod}`);
        // await initiateRefundViaFeda({
        //   orderId: order.id,
        //   amount: refundAmount,
        //   paymentMethod: order.paymentMethod,
        //   phoneNumber: order.buyerPhoneNumber,
        // });
      }
    }
    
    // Annuler la transaction en attente du vendeur
    await db.updateTransactionStatusByOrder(orderId, order.sellerId, 'cancelled');
    
    // Mettre à jour le statut
    await db.updateOrderPaymentStatus(orderId, 'refunded');
    await db.updateOrderStatus(orderId, 'cancelled');
    
    // Notifications
    await db.createNotification({
      userId: order.buyerId,
      type: 'payment',
      title: 'Remboursement effectué',
      content: `Vous avez été remboursé de ${refundAmount} ${order.currency} pour la commande #${orderId}.`,
      link: `/dashboard/wallet`,
    });
    
    await db.createNotification({
      userId: order.sellerId,
      type: 'order',
      title: 'Commande annulée et remboursée',
      content: `La commande #${orderId} a été annulée et remboursée. Raison: ${reason}`,
      link: `/dashboard/orders`,
    });
    
    console.log(`[Escrow] Refunded ${refundAmount} ${order.currency} for order #${orderId} by ${refundedBy}`);
    
    return { success: true };
  } catch (error) {
    console.error('[Escrow] Refund error:', error);
    return { success: false, error: 'Erreur lors du remboursement' };
  }
}

/**
 * Ouvre un litige sur une commande
 */
export async function openDispute(params: {
  orderId: number;
  openedBy: number;
  reason: string;
}): Promise<{ success: boolean; disputeId?: string; error?: string }> {
  try {
    const { orderId, openedBy, reason } = params;
    
    const order = await db.getOrderById(orderId);
    if (!order) {
      return { success: false, error: 'Commande non trouvée' };
    }
    
    if (order.buyerId !== openedBy && order.sellerId !== openedBy) {
      return { success: false, error: 'Non autorisé' };
    }
    
    if (order.status === 'disputed') {
      return { success: false, error: 'Litige déjà ouvert' };
    }
    
    const disputeId = `DIS-${nanoid(10)}`;
    
    // Mettre à jour le statut
    await db.updateOrderStatus(orderId, 'disputed');
    
    // Notifier les deux parties
    const otherParty = openedBy === order.buyerId ? order.sellerId : order.buyerId;
    const openerRole = openedBy === order.buyerId ? 'Client' : 'Freelance';
    
    await db.createNotification({
      userId: otherParty,
      type: 'order',
      title: 'Litige ouvert',
      content: `Un litige a été ouvert sur la commande #${orderId}. Notre équipe va examiner le cas.`,
      link: `/dashboard/orders`,
    });
    
    // Notifier tous les admins pour médiation
    try {
      const admins = await db.getAdminUsers();
      for (const admin of admins) {
        await db.createNotification({
          userId: admin.id,
          type: 'system', // Using system type for admin alerts
          title: `LITIGE OUVERT: Commande #${orderId}`,
          content: `${openerRole} a ouvert un litige.\n\nRaison: ${reason}\n\nID Litige: ${disputeId}`,
          link: `/admin/disputes/${disputeId}`,
        });
      }
    } catch (adminError) {
      console.error('[Escrow] Error notifying admins:', adminError);
      // Continue même si la notification admin échoue
    }
    
    console.log(`[Escrow] Dispute ${disputeId} opened for order #${orderId}: ${reason}`);
    
    return { success: true, disputeId };
  } catch (error) {
    console.error('[Escrow] Open dispute error:', error);
    return { success: false, error: 'Erreur lors de l\'ouverture du litige' };
  }
}

/**
 * Résout un litige (admin uniquement)
 */
export async function resolveDispute(params: {
  orderId: number;
  resolution: 'release_to_seller' | 'refund_to_buyer' | 'partial_refund';
  partialAmount?: number;
  adminNotes: string;
  resolvedBy: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { orderId, resolution, partialAmount, adminNotes, resolvedBy } = params;
    
    const order = await db.getOrderById(orderId);
    if (!order) {
      return { success: false, error: 'Commande non trouvée' };
    }
    
    if (order.status !== 'disputed') {
      return { success: false, error: 'Cette commande n\'est pas en litige' };
    }
    
    let result;
    
    switch (resolution) {
      case 'release_to_seller':
        result = await releaseEscrow({
          orderId,
          releasedBy: 'admin',
          reason: `Litige résolu en faveur du freelance. ${adminNotes}`,
        });
        break;
        
      case 'refund_to_buyer':
        result = await refundEscrow({
          orderId,
          reason: `Litige résolu en faveur du client. ${adminNotes}`,
          refundedBy: 'admin',
          initiateExternalRefund: true,
        });
        break;
        
      case 'partial_refund':
        if (!partialAmount) {
          return { success: false, error: 'Montant partiel requis' };
        }
        result = await refundEscrow({
          orderId,
          reason: `Litige résolu avec remboursement partiel. ${adminNotes}`,
          refundedBy: 'admin',
          partialAmount,
          initiateExternalRefund: true,
        });
        break;
        
      default:
        return { success: false, error: 'Résolution invalide' };
    }
    
    if (result.success) {
      // Notifier les deux parties de la résolution
      await db.createNotification({
        userId: order.buyerId,
        type: 'order',
        title: 'Litige résolu',
        content: `Le litige sur la commande #${orderId} a été résolu. ${adminNotes}`,
        link: `/dashboard/orders`,
      });
      
      await db.createNotification({
        userId: order.sellerId,
        type: 'order',
        title: 'Litige résolu',
        content: `Le litige sur la commande #${orderId} a été résolu. ${adminNotes}`,
        link: `/dashboard/orders`,
      });
      
      console.log(`[Escrow] Dispute resolved for order #${orderId} by admin ${resolvedBy}: ${resolution}`);
    }
    
    return result;
  } catch (error) {
    console.error('[Escrow] Resolve dispute error:', error);
    return { success: false, error: 'Erreur lors de la résolution du litige' };
  }
}

/**
 * Vérifie et libère automatiquement les escrows expirés
 * À appeler via un cron job
 */
export async function processAutoReleases(): Promise<{ processed: number; errors: number }> {
  let processed = 0;
  let errors = 0;
  
  try {
    const deliveredOrders = await db.getDeliveredOrdersForAutoRelease(ESCROW_CONFIG.AUTO_COMPLETE_DAYS);
    
    for (const order of deliveredOrders) {
      try {
        console.log(`[Escrow] Auto-releasing order #${order.id}`);
        const result = await releaseEscrow({
          orderId: order.id,
          releasedBy: 'auto',
          reason: `Libération automatique après ${ESCROW_CONFIG.AUTO_COMPLETE_DAYS} jours sans validation`,
        });
        
        if (result.success) {
          processed++;
        } else {
          errors++;
          console.error(`[Escrow] Failed to auto-release order #${order.id}: ${result.error}`);
        }
      } catch (orderError) {
        errors++;
        console.error(`[Escrow] Error auto-releasing order #${order.id}:`, orderError);
      }
    }
    
    console.log(`[Escrow] Auto-release completed: ${processed} processed, ${errors} errors`);
  } catch (error) {
    console.error('[Escrow] Auto-release batch error:', error);
  }
  
  return { processed, errors };
}

/**
 * Envoie des rappels pour les commandes livrées en attente de validation
 */
export async function sendValidationReminders(): Promise<{ sent: number }> {
  let sent = 0;
  
  try {
    // Récupérer les commandes livrées depuis plus de 3 jours mais moins de 7 jours
    const pendingOrders = await db.getDeliveredOrdersPendingValidation(3, 7);
    
    for (const order of pendingOrders) {
      try {
        // Skip if deliveredAt is null (shouldn't happen but safety check)
        if (!order.deliveredAt) continue;
        
        const daysRemaining = ESCROW_CONFIG.AUTO_COMPLETE_DAYS - Math.floor(
          (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        await db.createNotification({
          userId: order.buyerId,
          type: 'order',
          title: 'Rappel: Validez votre commande',
          content: `La commande #${order.id} attend votre validation. Elle sera automatiquement validée dans ${daysRemaining} jour(s).`,
          link: `/dashboard/orders`,
        });
        
        sent++;
      } catch (reminderError) {
        console.error(`[Escrow] Error sending reminder for order #${order.id}:`, reminderError);
      }
    }
    
    console.log(`[Escrow] Sent ${sent} validation reminders`);
  } catch (error) {
    console.error('[Escrow] Reminder batch error:', error);
  }
  
  return { sent };
}

/**
 * Initialise le cron job pour les auto-releases et rappels
 * À appeler au démarrage du serveur
 */
export function initializeEscrowCronJobs(): void {
  // Note: Cette fonction doit être appelée avec node-cron ou un scheduler similaire
  // Exemple d'utilisation:
  // 
  // import cron from 'node-cron';
  // import { processAutoReleases, sendValidationReminders } from './escrow';
  // 
  // // Exécuter auto-release chaque jour à 3h du matin
  // cron.schedule('0 3 * * *', async () => {
  //   console.log('[CRON] Running auto-release escrows...');
  //   await processAutoReleases();
  // });
  // 
  // // Envoyer rappels chaque jour à 10h
  // cron.schedule('0 10 * * *', async () => {
  //   console.log('[CRON] Sending validation reminders...');
  //   await sendValidationReminders();
  // });
  
  console.log('[Escrow] Cron jobs initialized - remember to set up node-cron in server/_core/index.ts');
}
