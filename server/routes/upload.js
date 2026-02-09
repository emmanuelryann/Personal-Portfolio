import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { verifyToken } from '../middleware/auth.js';
import { apiLimiter, uploadLimiter } from '../middleware/rateLimiter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Save to public/uploads so they are accessible by Vite/Frontend
const uploadDir = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

const ALLOWED_PDF_TYPES = {
  'application/pdf': ['.pdf']
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '-');
    const uniqueName = `${safeName}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedMimetypes = Object.keys(ALLOWED_IMAGE_TYPES);
  
  if (allowedMimetypes.includes(file.mimetype)) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ALLOWED_IMAGE_TYPES[file.mimetype];
    
    if (allowedExts.includes(ext)) {
      return cb(null, true);
    }
  }
  
  cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
};

// File filter for PDFs (CV/Resume)
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      return cb(null, true);
    }
  }
  
  cb(new Error('Only PDF files are allowed for CV uploads'));
};

// Multer configuration for images
const uploadImage = multer({ 
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: imageFilter
});

// Multer configuration for PDF/CV
const uploadPDF = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024,
    files: 1
  },
  fileFilter: pdfFilter
});

const router = Router();

// Upload image endpoint
router.post('/image', 
  verifyToken,
  uploadLimiter,
  uploadImage.single('image'), 
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({ 
        success: true, 
        message: 'Image uploaded successfully', 
        url: fileUrl,
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

// Upload CV/PDF endpoint
router.post('/cv', 
  verifyToken,
  uploadLimiter,
  uploadPDF.single('cv'), 
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        if (file.toLowerCase().endsWith('.pdf') && file !== req.file.filename) {
          try {
            fs.unlinkSync(path.join(uploadDir, file));
            console.log(`Deleted old CV: ${file}`);
          } catch (err) {
            console.error(`Failed to delete old CV: ${file}`, err);
          }
        }
      });
      
      res.json({ 
        success: true, 
        message: 'CV uploaded successfully', 
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

// Delete file endpoint
router.delete('/:filename', verifyToken, apiLimiter, (req, res) => {
  try {
    const { filename } = req.params;
    
    const safeName = path.basename(filename);
    const filePath = path.join(uploadDir, safeName);
    
    if (!filePath.startsWith(uploadDir)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file path' 
      });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    fs.unlinkSync(filePath);
    
    res.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete file' 
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB for images, 10MB for PDFs.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "image" for images or "cv" for PDFs.'
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