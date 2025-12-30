-- ===========================================
-- BÉNINFREELANCE - Données de Démonstration
-- ===========================================
-- Données réalistes pour le marché béninois
-- ===========================================

-- ===========================================
-- Catégories
-- ===========================================
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `color`, `image`) VALUES
('Développement & IT', 'developpement-it', 'Développement web, mobile, logiciels et solutions informatiques', 'Code', '#0D9488', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400'),
('Design & Créatif', 'design-creatif', 'Design graphique, UI/UX, branding et création visuelle', 'Palette', '#EC4899', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'),
('Marketing Digital', 'marketing-digital', 'SEO, publicité en ligne, réseaux sociaux et stratégie digitale', 'TrendingUp', '#3B82F6', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'),
('Rédaction & Traduction', 'redaction-traduction', 'Rédaction web, copywriting, traduction et correction', 'FileText', '#F59E0B', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400'),
('Vidéo & Animation', 'video-animation', 'Montage vidéo, motion design, animation 2D/3D', 'Video', '#8B5CF6', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400'),
('Musique & Audio', 'musique-audio', 'Production musicale, voix-off, podcast et sound design', 'Music', '#EF4444', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'),
('Formation & Coaching', 'formation', 'Cours en ligne, coaching, mentorat et développement personnel', 'GraduationCap', '#6366F1', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400'),
('Photographie', 'photographie', 'Photographie professionnelle, retouche et événementiel', 'Camera', '#14B8A6', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `image` = VALUES(`image`);

-- ===========================================
-- Utilisateurs Freelances Béninois
-- ===========================================
INSERT INTO `users` (`openId`, `name`, `email`, `role`, `userType`, `isSeller`, `avatar`, `bio`, `phone`, `city`, `country`, `skills`, `languages`, `responseTime`, `completedOrders`, `rating`, `totalReviews`, `passwordHash`, `emailVerified`) VALUES
('freelance_achille', 'Achille Koudjo', 'achille.koudjo@gmail.com', 'user', 'freelance', TRUE, 
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
 'Développeur Full-Stack passionné avec 5 ans d''expérience. Spécialisé en React, Node.js et applications mobiles. J''ai travaillé avec des startups locales et internationales pour créer des solutions digitales innovantes.',
 '+229 97 12 34 56', 'Cotonou', 'Bénin',
 '["React", "Node.js", "TypeScript", "MongoDB", "React Native", "AWS"]',
 '["Français", "Anglais", "Fon"]',
 '< 2 heures', 47, 4.95, 47,
 '$2b$10$dummyhashfordemopurposes123456789', TRUE),

('freelance_grace', 'Grâce Ahouandjinou', 'grace.ahouandjinou@gmail.com', 'user', 'freelance', TRUE,
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
 'Designer UI/UX créative avec un œil pour les détails. Je crée des interfaces utilisateur intuitives et esthétiques. Experte en Figma, Adobe XD et design systems.',
 '+229 96 45 67 89', 'Porto-Novo', 'Bénin',
 '["UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator", "Branding"]',
 '["Français", "Anglais"]',
 '< 4 heures', 32, 4.90, 32,
 '$2b$10$dummyhashfordemopurposes123456789', TRUE),

('freelance_koffi', 'Koffi Mensah', 'koffi.mensah@gmail.com', 'user', 'freelance', TRUE,
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
 'Expert en Marketing Digital et Growth Hacking. J''aide les entreprises béninoises à développer leur présence en ligne et à acquérir de nouveaux clients via les réseaux sociaux et le SEO.',
 '+229 95 78 90 12', 'Parakou', 'Bénin',
 '["SEO", "Google Ads", "Facebook Ads", "Community Management", "Analytics", "Content Marketing"]',
 '["Français", "Anglais", "Yoruba"]',
 '< 6 heures', 28, 4.85, 28,
 '$2b$10$dummyhashfordemopurposes123456789', TRUE),

('freelance_amina', 'Amina Sanni', 'amina.sanni@gmail.com', 'user', 'freelance', TRUE,
 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
 'Rédactrice web et copywriter bilingue. Je rédige des contenus engageants pour sites web, blogs et réseaux sociaux. Spécialisée dans les secteurs tech et e-commerce.',
 '+229 94 23 45 67', 'Cotonou', 'Bénin',
 '["Rédaction Web", "Copywriting", "SEO Writing", "Traduction FR-EN", "Blogging", "Storytelling"]',
 '["Français", "Anglais", "Fon"]',
 '< 3 heures', 56, 4.92, 56,
 '$2b$10$dummyhashfordemopurposes123456789', TRUE),

('freelance_boris', 'Boris Hounkpatin', 'boris.hounkpatin@gmail.com', 'user', 'freelance', TRUE,
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
 'Vidéaste et motion designer créatif. Je produis des vidéos promotionnelles, des animations et du contenu pour les réseaux sociaux. Équipé d''un studio professionnel à Cotonou.',
 '+229 97 89 01 23', 'Cotonou', 'Bénin',
 '["Montage Vidéo", "After Effects", "Premiere Pro", "Motion Design", "Animation 2D", "Drone"]',
 '["Français", "Anglais"]',
 '< 12 heures', 23, 4.88, 23,
 '$2b$10$dummyhashfordemopurposes123456789', TRUE),

('freelance_fatou', 'Fatou Djossou', 'fatou.djossou@gmail.com', 'user', 'freelance', TRUE,
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
 'Développeuse mobile spécialisée en Flutter et React Native. Je crée des applications performantes pour iOS et Android. Passionnée par l''innovation technologique en Afrique.',
 '+229 96 34 56 78', 'Abomey-Calavi', 'Bénin',
 '["Flutter", "React Native", "Dart", "Firebase", "iOS", "Android"]',
 '["Français", "Anglais", "Mina"]',
 '< 4 heures', 19, 4.95, 19,
 '$2b$10$dummyhashfordemopurposes123456789', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ===========================================
-- Utilisateurs Clients
-- ===========================================
INSERT INTO `users` (`openId`, `name`, `email`, `role`, `userType`, `isSeller`, `avatar`, `bio`, `phone`, `city`, `country`, `passwordHash`, `emailVerified`) VALUES
('client_entreprise1', 'TechBénin SARL', 'contact@techbenin.com', 'user', 'client', FALSE,
 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
 'Startup technologique basée à Cotonou, spécialisée dans les solutions fintech pour l''Afrique de l''Ouest.',
 '+229 21 30 45 67', 'Cotonou', 'Bénin',
 '$2b$10$dummyhashfordemopurposes123456789', TRUE),

('client_entreprise2', 'AgriPlus Bénin', 'info@agriplus.bj', 'user', 'client', FALSE,
 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=150&h=150&fit=crop',
 'Entreprise agricole innovante cherchant à digitaliser ses processus et à développer sa présence en ligne.',
 '+229 21 31 56 78', 'Parakou', 'Bénin',
 '$2b$10$dummyhashfordemopurposes123456789', TRUE),

('client_pme', 'Boutique Mode Cotonou', 'boutique.mode@gmail.com', 'user', 'client', FALSE,
 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop',
 'Boutique de mode africaine cherchant à développer sa présence e-commerce.',
 '+229 97 56 78 90', 'Cotonou', 'Bénin',
 '$2b$10$dummyhashfordemopurposes123456789', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ===========================================
-- Services (Gigs)
-- ===========================================
INSERT INTO `services` (`userId`, `categoryId`, `title`, `slug`, `description`, `shortDescription`, `price`, `currency`, `deliveryTime`, `revisions`, `coverImage`, `features`, `tags`, `status`, `totalOrders`, `totalStars`, `starCount`) VALUES
-- Services d'Achille (Développement)
((SELECT id FROM users WHERE openId = 'freelance_achille'), 
 (SELECT id FROM categories WHERE slug = 'developpement-it'),
 'Développement de site web professionnel React/Next.js',
 'developpement-site-web-react-nextjs',
 'Je développe votre site web professionnel avec les dernières technologies React et Next.js. Site responsive, optimisé SEO et performant. Inclut l''hébergement gratuit pendant 1 mois sur Vercel.',
 'Site web moderne et performant avec React/Next.js',
 150000, 'XOF', 7, 3,
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
 '["Site responsive", "Optimisation SEO", "Hébergement 1 mois", "Support technique", "Code source"]',
 '["React", "Next.js", "Site web", "Développement"]',
 'active', 23, 115, 23),

((SELECT id FROM users WHERE openId = 'freelance_achille'),
 (SELECT id FROM categories WHERE slug = 'developpement-it'),
 'Application mobile React Native (iOS & Android)',
 'application-mobile-react-native',
 'Je crée votre application mobile cross-platform avec React Native. Une seule base de code pour iOS et Android. Design moderne, performances natives et publication sur les stores.',
 'Application mobile cross-platform iOS et Android',
 350000, 'XOF', 21, 2,
 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
 '["iOS & Android", "Design UI/UX", "Publication stores", "Support 3 mois", "Code source"]',
 '["React Native", "Mobile", "iOS", "Android"]',
 'active', 12, 60, 12),

-- Services de Grâce (Design)
((SELECT id FROM users WHERE openId = 'freelance_grace'),
 (SELECT id FROM categories WHERE slug = 'design-creatif'),
 'Création de logo professionnel et identité visuelle',
 'creation-logo-identite-visuelle',
 'Je crée votre logo professionnel et votre identité visuelle complète. Vous recevrez plusieurs propositions, des fichiers haute résolution et un guide d''utilisation de votre marque.',
 'Logo professionnel et identité visuelle complète',
 75000, 'XOF', 5, 5,
 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
 '["3 propositions", "Fichiers HD", "Guide de marque", "Formats vectoriels", "Révisions illimitées"]',
 '["Logo", "Branding", "Identité visuelle", "Design"]',
 'active', 45, 225, 45),

((SELECT id FROM users WHERE openId = 'freelance_grace'),
 (SELECT id FROM categories WHERE slug = 'design-creatif'),
 'Design UI/UX complet pour application mobile',
 'design-ui-ux-application-mobile',
 'Je conçois l''interface utilisateur complète de votre application mobile. Wireframes, maquettes haute fidélité, prototypes interactifs et design system.',
 'Design UI/UX professionnel pour app mobile',
 200000, 'XOF', 10, 3,
 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
 '["Wireframes", "Maquettes HD", "Prototype Figma", "Design System", "Fichiers sources"]',
 '["UI/UX", "Mobile", "Figma", "Design"]',
 'active', 18, 90, 18),

-- Services de Koffi (Marketing)
((SELECT id FROM users WHERE openId = 'freelance_koffi'),
 (SELECT id FROM categories WHERE slug = 'marketing-digital'),
 'Gestion complète de vos réseaux sociaux (1 mois)',
 'gestion-reseaux-sociaux-mensuel',
 'Je gère vos réseaux sociaux pendant 1 mois : création de contenu, publication, interaction avec votre communauté et rapport mensuel. Facebook, Instagram, LinkedIn et TikTok.',
 'Gestion complète de vos réseaux sociaux',
 100000, 'XOF', 30, 2,
 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
 '["20 publications/mois", "Stories quotidiennes", "Interaction communauté", "Rapport mensuel", "4 réseaux"]',
 '["Social Media", "Community Management", "Marketing"]',
 'active', 34, 170, 34),

((SELECT id FROM users WHERE openId = 'freelance_koffi'),
 (SELECT id FROM categories WHERE slug = 'marketing-digital'),
 'Campagne publicitaire Facebook & Instagram Ads',
 'campagne-facebook-instagram-ads',
 'Je crée et optimise vos campagnes publicitaires sur Facebook et Instagram. Ciblage précis, créatifs engageants et optimisation continue pour maximiser votre ROI.',
 'Campagne publicitaire Facebook & Instagram optimisée',
 80000, 'XOF', 7, 3,
 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
 '["Création créatifs", "Ciblage avancé", "A/B Testing", "Optimisation", "Rapport détaillé"]',
 '["Facebook Ads", "Instagram Ads", "Publicité", "Marketing"]',
 'active', 28, 140, 28),

-- Services d'Amina (Rédaction)
((SELECT id FROM users WHERE openId = 'freelance_amina'),
 (SELECT id FROM categories WHERE slug = 'redaction-traduction'),
 'Rédaction d''articles de blog SEO optimisés',
 'redaction-articles-blog-seo',
 'Je rédige des articles de blog optimisés pour le référencement naturel. Recherche de mots-clés, structure SEO, contenu engageant et unique. Parfait pour booster votre visibilité.',
 'Articles de blog SEO pour booster votre visibilité',
 25000, 'XOF', 3, 2,
 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
 '["1000-1500 mots", "Optimisation SEO", "Recherche mots-clés", "Images libres de droits", "Méta description"]',
 '["Rédaction", "SEO", "Blog", "Content"]',
 'active', 67, 335, 67),

((SELECT id FROM users WHERE openId = 'freelance_amina'),
 (SELECT id FROM categories WHERE slug = 'redaction-traduction'),
 'Traduction professionnelle Français-Anglais',
 'traduction-francais-anglais',
 'Je traduis vos documents du français vers l''anglais ou vice versa. Traduction professionnelle, fidèle au sens original et adaptée à votre audience cible.',
 'Traduction professionnelle FR-EN / EN-FR',
 15000, 'XOF', 2, 2,
 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
 '["1000 mots", "Relecture incluse", "Terminologie spécialisée", "Livraison rapide", "Confidentialité"]',
 '["Traduction", "Français", "Anglais", "Localisation"]',
 'active', 42, 210, 42),

-- Services de Boris (Vidéo)
((SELECT id FROM users WHERE openId = 'freelance_boris'),
 (SELECT id FROM categories WHERE slug = 'video-animation'),
 'Montage vidéo professionnel pour réseaux sociaux',
 'montage-video-reseaux-sociaux',
 'Je monte vos vidéos pour les réseaux sociaux : Reels, TikTok, YouTube Shorts. Transitions dynamiques, sous-titres, musique et effets pour maximiser l''engagement.',
 'Montage vidéo dynamique pour réseaux sociaux',
 35000, 'XOF', 3, 2,
 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
 '["Vidéo jusqu''à 60s", "Sous-titres", "Musique libre", "Effets dynamiques", "Format optimisé"]',
 '["Montage vidéo", "Reels", "TikTok", "Social Media"]',
 'active', 29, 145, 29),

((SELECT id FROM users WHERE openId = 'freelance_boris'),
 (SELECT id FROM categories WHERE slug = 'video-animation'),
 'Vidéo promotionnelle d''entreprise',
 'video-promotionnelle-entreprise',
 'Je produis votre vidéo promotionnelle d''entreprise : tournage, montage, motion graphics et sound design. Parfait pour présenter votre entreprise ou vos produits.',
 'Vidéo promotionnelle professionnelle pour entreprise',
 250000, 'XOF', 14, 2,
 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
 '["Tournage HD", "Montage pro", "Motion graphics", "Voix-off", "Musique originale"]',
 '["Vidéo corporate", "Promotion", "Entreprise", "Production"]',
 'active', 11, 55, 11),

-- Services de Fatou (Mobile)
((SELECT id FROM users WHERE openId = 'freelance_fatou'),
 (SELECT id FROM categories WHERE slug = 'developpement-it'),
 'Application mobile Flutter sur mesure',
 'application-mobile-flutter',
 'Je développe votre application mobile avec Flutter pour des performances natives sur iOS et Android. Interface fluide, animations élégantes et intégration Firebase.',
 'Application mobile Flutter haute performance',
 400000, 'XOF', 28, 2,
 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
 '["iOS & Android", "Design moderne", "Firebase", "Publication stores", "Support 6 mois"]',
 '["Flutter", "Mobile", "iOS", "Android", "Firebase"]',
 'active', 15, 75, 15)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- ===========================================
-- Projets Publics
-- ===========================================
INSERT INTO `projects` (`title`, `slug`, `description`, `clientId`, `categoryId`, `budgetMin`, `budgetMax`, `budgetType`, `currency`, `status`, `visibility`, `deadline`, `duration`, `experienceLevel`, `skills`, `viewCount`, `applicationCount`) VALUES
('Développement d''une application e-commerce mobile',
 'developpement-application-ecommerce-mobile',
 'Nous recherchons un développeur mobile expérimenté pour créer une application e-commerce pour notre boutique de mode africaine. L''application doit permettre aux clients de parcourir nos produits, passer des commandes et payer via Mobile Money (MTN, Moov). Nous avons déjà le design Figma prêt.',
 (SELECT id FROM users WHERE openId = 'client_pme'),
 (SELECT id FROM categories WHERE slug = 'developpement-it'),
 300000, 500000, 'fixed', 'XOF', 'open', 'public',
 DATE_ADD(NOW(), INTERVAL 30 DAY), '4-6 semaines', 'intermediate',
 '["React Native", "Flutter", "Mobile Money", "E-commerce"]',
 156, 8),

('Refonte complète de notre site web corporate',
 'refonte-site-web-corporate',
 'TechBénin cherche à refaire entièrement son site web corporate. Nous voulons un design moderne, professionnel et qui reflète notre positionnement innovant dans la fintech. Le site doit être responsive, rapide et optimisé pour le SEO.',
 (SELECT id FROM users WHERE openId = 'client_entreprise1'),
 (SELECT id FROM categories WHERE slug = 'developpement-it'),
 400000, 700000, 'fixed', 'XOF', 'open', 'public',
 DATE_ADD(NOW(), INTERVAL 45 DAY), '6-8 semaines', 'expert',
 '["React", "Next.js", "SEO", "Design responsive"]',
 234, 12),

('Création d''identité visuelle pour startup agricole',
 'creation-identite-visuelle-startup-agricole',
 'AgriPlus Bénin lance une nouvelle marque de produits agricoles biologiques. Nous avons besoin d''un designer créatif pour créer notre logo, charte graphique et packaging. Le design doit refléter nos valeurs : nature, innovation et authenticité africaine.',
 (SELECT id FROM users WHERE openId = 'client_entreprise2'),
 (SELECT id FROM categories WHERE slug = 'design-creatif'),
 150000, 250000, 'fixed', 'XOF', 'open', 'public',
 DATE_ADD(NOW(), INTERVAL 21 DAY), '2-3 semaines', 'intermediate',
 '["Logo", "Branding", "Packaging", "Charte graphique"]',
 189, 15),

('Gestion des réseaux sociaux pour 3 mois',
 'gestion-reseaux-sociaux-3-mois',
 'Notre boutique de mode cherche un community manager pour gérer nos réseaux sociaux pendant 3 mois. Objectif : augmenter notre visibilité et nos ventes en ligne. Nous sommes présents sur Instagram, Facebook et TikTok.',
 (SELECT id FROM users WHERE openId = 'client_pme'),
 (SELECT id FROM categories WHERE slug = 'marketing-digital'),
 200000, 300000, 'fixed', 'XOF', 'open', 'public',
 DATE_ADD(NOW(), INTERVAL 14 DAY), '3 mois', 'intermediate',
 '["Community Management", "Instagram", "TikTok", "Content Creation"]',
 145, 9),

('Rédaction de contenu pour site web fintech',
 'redaction-contenu-site-fintech',
 'Nous avons besoin d''un rédacteur web expérimenté pour rédiger le contenu de notre nouveau site web fintech. Environ 15 pages à rédiger : accueil, services, à propos, FAQ, blog (5 articles). Le ton doit être professionnel mais accessible.',
 (SELECT id FROM users WHERE openId = 'client_entreprise1'),
 (SELECT id FROM categories WHERE slug = 'redaction-traduction'),
 100000, 150000, 'fixed', 'XOF', 'open', 'public',
 DATE_ADD(NOW(), INTERVAL 21 DAY), '2-3 semaines', 'intermediate',
 '["Rédaction web", "SEO", "Fintech", "Copywriting"]',
 98, 6),

('Vidéo de présentation d''entreprise',
 'video-presentation-entreprise',
 'AgriPlus Bénin souhaite produire une vidéo de présentation de 2-3 minutes pour notre site web et nos réseaux sociaux. La vidéo doit présenter notre mission, nos produits et notre équipe. Tournage dans nos locaux à Parakou.',
 (SELECT id FROM users WHERE openId = 'client_entreprise2'),
 (SELECT id FROM categories WHERE slug = 'video-animation'),
 200000, 350000, 'fixed', 'XOF', 'open', 'public',
 DATE_ADD(NOW(), INTERVAL 30 DAY), '3-4 semaines', 'intermediate',
 '["Vidéo corporate", "Tournage", "Montage", "Motion design"]',
 112, 5)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- ===========================================
-- Wallets pour les freelances
-- ===========================================
INSERT INTO `wallets` (`userId`, `balance`, `pendingBalance`, `currency`) 
SELECT id, 
       FLOOR(RAND() * 500000) + 100000, 
       FLOOR(RAND() * 100000),
       'XOF'
FROM users WHERE userType = 'freelance' AND isSeller = TRUE
ON DUPLICATE KEY UPDATE `balance` = VALUES(`balance`);

-- ===========================================
-- FIN DU SEED DEMO
-- ===========================================
