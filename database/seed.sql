-- ===========================================
-- ORBIT - Données Initiales (Seed)
-- ===========================================
-- Exécutez ce script après schema.sql pour initialiser les catégories
-- ===========================================

-- ===========================================
-- Catégories par défaut
-- ===========================================
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `color`) VALUES
('Développement & IT', 'developpement-it', 'Développement web, mobile, logiciels et solutions informatiques', 'Code', '#0D9488'),
('Design & Créatif', 'design-creatif', 'Design graphique, UI/UX, branding et création visuelle', 'Palette', '#EC4899'),
('Marketing Digital', 'marketing-digital', 'SEO, publicité en ligne, réseaux sociaux et stratégie digitale', 'TrendingUp', '#3B82F6'),
('Rédaction & Traduction', 'redaction-traduction', 'Rédaction web, copywriting, traduction et correction', 'FileText', '#F59E0B'),
('Vidéo & Animation', 'video-animation', 'Montage vidéo, motion design, animation 2D/3D', 'Video', '#8B5CF6'),
('Musique & Audio', 'musique-audio', 'Production musicale, voix-off, podcast et sound design', 'Music', '#EF4444'),
('Business & Conseil', 'business', 'Consulting, business plan, analyse de données et stratégie', 'Briefcase', '#10B981'),
('Formation & Coaching', 'formation', 'Cours en ligne, coaching, mentorat et développement personnel', 'GraduationCap', '#6366F1')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ===========================================
-- Utilisateur Admin (Optionnel)
-- ===========================================
-- Décommentez et modifiez pour créer un admin initial
-- INSERT INTO `users` (`openId`, `name`, `email`, `role`, `userType`, `isSeller`) VALUES
-- ('admin_initial', 'Admin Orbit', 'admin@orbit.com', 'admin', 'client', FALSE);

-- ===========================================
-- FIN DU SEED
-- ===========================================
