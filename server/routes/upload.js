import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.js';
import { apiLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import { storage } from '../config/cloudinary.js';

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
});

const router = Router();

router.post('/image', 
  verifyToken,
  uploadLimiter,
  upload.single('image'), 
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Image uploaded successfully', 
        url: req.file.path,
        filename: req.file.filename,
        size: req.file.size
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Upload failed' 
      });
    }
  }
);

router.post('/cv', 
  verifyToken,
  uploadLimiter,
  upload.single('cv'), 
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'CV uploaded successfully', 
        url: req.file.path,
        filename: req.file.filename,
        size: req.file.size
      });

    } catch (error) {
      console.error('CV upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'CV upload failed' 
      });
    }
  }
);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

export default router;