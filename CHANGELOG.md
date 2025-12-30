# BeFree Platform - Changelog

## Version 2.0.0 - Production Release

### Date: 28 Décembre 2025

---

## 1. Corrections de Bugs UI & Navigation

### Footer
- **Suppression des icônes Visa/Mastercard** : Les icônes de paiement ont été retirées du footer conformément aux exigences.

### Routes Corrigées
Les pages suivantes sont maintenant fonctionnelles :

| Page | Route | Description |
|------|-------|-------------|
| Terms & Conditions | `/terms` | Conditions générales d'utilisation |
| Privacy Policy | `/privacy` | Politique de confidentialité |
| Cookies Policy | `/cookies` | Politique des cookies |
| Help Center | `/help` | Centre d'aide |
| FAQ | `/faq` | Questions fréquemment posées |
| Contact Us | `/contact` | Page de contact |
| How It Works | `/how-it-works` | Comment ça marche |

---

## 2. Corrections API Critiques

### Erreur JSON/Server (Unexpected token '<')
- **Problème** : Les endpoints retournaient des pages HTML (404/500) au lieu de JSON.
- **Solution** : 
  - Création de `server/uploadRoutes.ts` pour gérer les uploads de fichiers
  - Configuration correcte des routes Express pour retourner du JSON
  - Gestion des erreurs avec réponses JSON appropriées

### Upload de Photo de Profil
- **Nouveau endpoint** : `POST /api/upload`
- **Fonctionnalités** :
  - Upload vers AWS S3
  - Validation du type de fichier (images uniquement)
  - Limite de taille (5MB)
  - Retour de l'URL publique

---

## 3. Nouvelles Fonctionnalités

### 3.1 Système RBAC (Role-Based Access Control)

**Fichiers créés/modifiés :**
- `client/src/hooks/useRBAC.ts` - Hook React pour la gestion des permissions
- `server/_core/trpc.ts` - Procédures protégées par rôle

**Rôles disponibles :**

| Rôle | Permissions |
|------|-------------|
| `super_admin` | Accès total, gestion des admins |
| `admin` | Gestion des utilisateurs, KYC, modération |
| `freelance` | Création de services, gestion de profil |
| `client` | Commandes, projets, messagerie |

**Utilisation :**
```typescript
import { useRBAC } from '@/hooks/useRBAC';

const { hasRole, hasPermission, isAdmin } = useRBAC();

if (hasPermission('manage_users')) {
  // Afficher le bouton admin
}
```

### 3.2 Système KYC (Know Your Customer)

**Nouvelles tables de base de données :**
- `kycDocuments` - Stockage des documents d'identité

**Workflow KYC :**
1. Freelancer soumet ses documents (ID, selfie)
2. Statut passe à "pending"
3. Admin examine les documents
4. Admin approuve/rejette avec commentaire
5. Freelancer notifié du résultat

**Pages Admin :**
- `/admin/dashboard` - Tableau de bord admin
- `/admin/kyc` - Validation des documents KYC
- `/admin/users` - Gestion des utilisateurs

### 3.3 Profil Freelancer Avancé (Style LinkedIn)

**Nouvelles sections :**
- **Portfolio visuel** avec galerie d'images
- **Certifications** avec dates et liens de vérification
- **Avis clients** avec notes détaillées
- **Badges** (Vérifié, Top Rated, etc.)

**Nouvelles tables :**
- `portfolioItems` - Projets du portfolio
- `certifications` - Certifications professionnelles
- `mutualReviews` - Avis bidirectionnels
- `userBadges` - Badges et distinctions

### 3.4 Messagerie Temps Réel (Socket.IO)

**Fichiers créés :**
- `server/socketHandler.ts` - Gestionnaire Socket.IO côté serveur
- `client/src/hooks/useSocket.ts` - Hook React pour Socket.IO

**Fonctionnalités :**
- Messages instantanés
- Indicateur de frappe ("X est en train d'écrire...")
- Statut de lecture (envoyé, délivré, lu)
- Indicateur de présence en ligne
- Notifications push en temps réel

**Événements Socket.IO :**

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `authenticate` | Client → Server | Authentification utilisateur |
| `join_conversation` | Client → Server | Rejoindre une conversation |
| `send_message` | Client → Server | Envoyer un message |
| `new_message` | Server → Client | Nouveau message reçu |
| `user_typing` | Bidirectionnel | Indicateur de frappe |
| `messages_read` | Server → Client | Messages marqués comme lus |
| `user_online/offline` | Server → Client | Statut de présence |

### 3.5 Système de Notation Mutuelle

**Composant :** `client/src/components/MutualReviewModal.tsx`

**Caractéristiques :**
- Note globale (1-5 étoiles)
- Notes détaillées par catégorie :
  - Communication
  - Qualité du travail
  - Respect des délais
  - Professionnalisme
- Commentaire optionnel
- Calcul automatique de la moyenne

**Règles :**
- Disponible uniquement après commande terminée
- Une seule évaluation par partie par commande
- Les deux parties peuvent s'évaluer mutuellement

---

## 4. Mise à Jour du Schéma de Base de Données

### Nouvelles Tables

```sql
-- Documents KYC
CREATE TABLE kycDocuments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  documentType ENUM('national_id', 'passport', 'driver_license', 'selfie'),
  documentUrl TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected'),
  reviewedBy INT,
  reviewNote TEXT,
  ...
);

-- Portfolio
CREATE TABLE portfolioItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  imageUrl TEXT NOT NULL,
  tags TEXT,
  ...
);

-- Certifications
CREATE TABLE certifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuingOrganization VARCHAR(255) NOT NULL,
  credentialUrl TEXT,
  ...
);

-- Avis Mutuels
CREATE TABLE mutualReviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  reviewerId INT NOT NULL,
  revieweeId INT NOT NULL,
  reviewerType ENUM('client', 'freelancer'),
  rating INT NOT NULL,
  communicationRating INT,
  qualityRating INT,
  timelinessRating INT,
  professionalismRating INT,
  comment TEXT,
  ...
);

-- Badges Utilisateur
CREATE TABLE userBadges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  badgeType ENUM('verified_identity', 'top_rated', ...),
  earnedAt TIMESTAMP,
  ...
);
```

### Modifications de Tables Existantes

**Table `users` :**
- Ajout de `kycStatus` (none, pending, verified, rejected)
- Ajout de `kycSubmittedAt`
- Ajout de `kycVerifiedAt`

---

## 5. Dépendances Ajoutées

```json
{
  "socket.io": "^4.7.5",
  "socket.io-client": "^4.7.5"
}
```

---

## 6. Structure des Fichiers Modifiés/Créés

```
befree-final/
├── client/src/
│   ├── components/
│   │   ├── Footer.tsx (modifié)
│   │   └── MutualReviewModal.tsx (nouveau)
│   ├── hooks/
│   │   ├── useRBAC.ts (nouveau)
│   │   └── useSocket.ts (nouveau)
│   └── pages/
│       ├── Terms.tsx (nouveau)
│       ├── Privacy.tsx (nouveau)
│       ├── Cookies.tsx (nouveau)
│       ├── Help.tsx (nouveau)
│       ├── FAQ.tsx (nouveau)
│       ├── Contact.tsx (nouveau)
│       ├── HowItWorks.tsx (nouveau)
│       ├── Profile.tsx (modifié - redesign)
│       ├── Messages.tsx (modifié - Socket.IO)
│       ├── AdminDashboard.tsx (nouveau)
│       ├── AdminKYC.tsx (nouveau)
│       └── AdminUsers.tsx (nouveau)
├── server/
│   ├── uploadRoutes.ts (nouveau)
│   ├── socketHandler.ts (nouveau)
│   ├── db.ts (modifié)
│   ├── routers.ts (modifié)
│   └── _core/
│       ├── index.ts (modifié)
│       └── trpc.ts (modifié)
├── drizzle/
│   └── schema.ts (modifié)
└── package.json (modifié)
```

---

## 7. Instructions de Déploiement

### Prérequis
- Node.js 18+
- MySQL 8.0+
- AWS S3 (pour les uploads)

### Installation

```bash
# Installer les dépendances
pnpm install

# Appliquer les migrations de base de données
pnpm db:push

# Démarrer en développement
pnpm dev

# Build pour production
pnpm build

# Démarrer en production
pnpm start
```

### Variables d'Environnement

```env
DATABASE_URL=mysql://user:password@host:3306/database
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=xxx
AWS_REGION=xxx
```

---

## 8. Tests Recommandés

### Tests Fonctionnels
- [ ] Vérifier toutes les nouvelles routes (Terms, Privacy, etc.)
- [ ] Tester l'upload de photo de profil
- [ ] Tester le workflow KYC complet
- [ ] Tester la messagerie temps réel
- [ ] Tester le système de notation mutuelle

### Tests de Sécurité
- [ ] Vérifier les permissions RBAC
- [ ] Tester l'accès aux pages admin sans autorisation
- [ ] Vérifier la validation des fichiers uploadés

---

## Contact

Pour toute question concernant ces modifications, veuillez contacter l'équipe de développement.


---

## Version 3.2.0 (28 Décembre 2025)

### Améliorations de l'expérience utilisateur

#### Navigation et Scroll
- **Ajout du composant ScrollToTop** : La page défile automatiquement vers le haut lors de la navigation entre les pages
- **Correction du positionnement FAQ** : Le titre de la page FAQ s'affiche correctement avec un espacement approprié (pt-24)
- **Liens du Footer améliorés** : Tous les liens du footer déclenchent maintenant un scroll vers le haut avant la navigation
- **Bouton "Retour en haut"** : Ajout d'un bouton dans le footer pour remonter en haut de page

#### Logo et Interactions tactiles
- **Logo non-interactif** : Désactivation des interactions tactiles (rotation/drag) sur le logo pour les appareils mobiles
- **Propriété className** : Le composant Logo accepte maintenant une prop `className` pour plus de flexibilité
- **Suppression des animations** : Le logo reste statique sans effets de rotation au survol

#### Composants UI
- **Badge variants** : Ajout des variants `success` (vert) et `warning` (jaune) au composant Badge
- **ServiceCard** : Ajout de la prop `isFavorited` pour gérer l'état des favoris
- **Types corrigés** : Correction des types TypeScript pour accepter les valeurs null dans les interfaces

### Corrections techniques

#### TypeScript
- Correction des imports `useAuth` dans les fichiers AdminDashboard et useRBAC
- Correction des types dans AdminKYC.tsx et AdminUsers.tsx pour accepter les valeurs null
- Suppression des imports dupliqués dans server/db.ts
- Suppression des fonctions dupliquées (createMutualReview, getReviewsForUser, canReviewOrder, etc.)

#### Dépendances
- Ajout de `multer` et `@types/multer` pour la gestion des uploads

### Fichiers modifiés
- `client/src/App.tsx` - Ajout de ScrollToTop
- `client/src/components/ScrollToTop.tsx` - Nouveau composant
- `client/src/components/Logo.tsx` - Désactivation des interactions tactiles
- `client/src/components/Footer.tsx` - Liens avec scroll et bouton retour en haut
- `client/src/components/ServiceCard.tsx` - Prop isFavorited
- `client/src/components/ui/badge.tsx` - Variants success/warning
- `client/src/pages/FAQ.tsx` - Correction du positionnement
- `client/src/pages/AdminKYC.tsx` - Types corrigés
- `client/src/pages/AdminUsers.tsx` - Types corrigés
- `client/src/pages/AdminDashboard.tsx` - Import corrigé
- `client/src/hooks/useRBAC.ts` - Import corrigé + React.createElement
- `server/db.ts` - Suppression des duplications

### Notes de déploiement
- Exécuter `pnpm install` pour installer les nouvelles dépendances
- Les variables d'environnement restent inchangées (voir `.env.example`)
- Le build client fonctionne correctement (`pnpm vite build`)
