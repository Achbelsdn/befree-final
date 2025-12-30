import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { storagePut } from './storage';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  },
});

export function createUploadRouter(): Router {
  const router = Router();

  // Single file upload endpoint
  router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const file = req.file;
      const ext = path.extname(file.originalname);
      const filename = `${nanoid(16)}${ext}`;
      const folder = req.body.folder || 'uploads';
      const key = `${folder}/${filename}`;

      // Upload to storage
      const result = await storagePut(key, file.buffer, file.mimetype);

      return res.json({
        success: true,
        url: result.url,
        key: result.key,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      return res.status(500).json({ 
        error: error.message || 'Erreur lors de l\'upload du fichier' 
      });
    }
  });

  // Profile picture upload endpoint
  router.post('/upload/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune image fournie' });
      }

      const file = req.file;
      
      // Validate image type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Le fichier doit être une image' });
      }

      // Validate size (2MB max for avatars)
      if (file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'L\'image ne doit pas dépasser 2MB' });
      }

      const ext = path.extname(file.originalname) || '.jpg';
      const filename = `avatar-${nanoid(16)}${ext}`;
      const key = `avatars/${filename}`;

      // Upload to storage
      const result = await storagePut(key, file.buffer, file.mimetype);

      return res.json({
        success: true,
        url: result.url,
        key: result.key,
      });
    } catch (error: any) {
      console.error('[Upload Avatar] Error:', error);
      return res.status(500).json({ 
        error: error.message || 'Erreur lors de l\'upload de l\'avatar' 
      });
    }
  });

  // KYC document upload endpoint
  router.post('/upload/kyc', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun document fourni' });
      }

      const file = req.file;
      const documentType = req.body.documentType || 'id';

      // Validate file type (images and PDFs only)
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          error: 'Format non accepté. Utilisez JPG, PNG ou PDF.' 
        });
      }

      // Validate size (5MB max for KYC documents)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Le document ne doit pas dépasser 5MB' });
      }

      const ext = path.extname(file.originalname) || '.jpg';
      const filename = `kyc-${documentType}-${nanoid(16)}${ext}`;
      const key = `kyc/${filename}`;

      // Upload to storage
      const result = await storagePut(key, file.buffer, file.mimetype);

      return res.json({
        success: true,
        url: result.url,
        key: result.key,
        documentType,
      });
    } catch (error: any) {
      console.error('[Upload KYC] Error:', error);
      return res.status(500).json({ 
        error: error.message || 'Erreur lors de l\'upload du document' 
      });
    }
  });

  // Portfolio image upload endpoint
  router.post('/upload/portfolio', upload.array('images', 10), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Aucune image fournie' });
      }

      const uploadedFiles = [];

      for (const file of files) {
        // Validate image type
        if (!file.mimetype.startsWith('image/')) {
          continue;
        }

        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `portfolio-${nanoid(16)}${ext}`;
        const key = `portfolio/${filename}`;

        const result = await storagePut(key, file.buffer, file.mimetype);
        uploadedFiles.push({
          url: result.url,
          key: result.key,
          filename: file.originalname,
        });
      }

      return res.json({
        success: true,
        files: uploadedFiles,
      });
    } catch (error: any) {
      console.error('[Upload Portfolio] Error:', error);
      return res.status(500).json({ 
        error: error.message || 'Erreur lors de l\'upload des images' 
      });
    }
  });

  // Service images upload endpoint
  router.post('/upload/service', upload.array('images', 5), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Aucune image fournie' });
      }

      const uploadedFiles = [];

      for (const file of files) {
        // Validate image type
        if (!file.mimetype.startsWith('image/')) {
          continue;
        }

        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `service-${nanoid(16)}${ext}`;
        const key = `services/${filename}`;

        const result = await storagePut(key, file.buffer, file.mimetype);
        uploadedFiles.push({
          url: result.url,
          key: result.key,
          filename: file.originalname,
        });
      }

      return res.json({
        success: true,
        files: uploadedFiles,
      });
    } catch (error: any) {
      console.error('[Upload Service] Error:', error);
      return res.status(500).json({ 
        error: error.message || 'Erreur lors de l\'upload des images' 
      });
    }
  });

  return router;
}
