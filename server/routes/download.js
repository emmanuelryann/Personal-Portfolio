import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiLimiter } from '../middleware/rateLimiter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');

const router = Router();

// Download CV endpoint - PUBLIC but rate limited
router.get('/', apiLimiter, (req, res) => {
  try {
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({ 
        success: false, 
        message: 'No CV available for download.' 
      });
    }
    
    // Find the latest PDF file
    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'CV not found. Please check back later.' 
      });
    }
    
    // Get the most recent PDF (by filename timestamp)
    const latestPDF = pdfFiles.sort((a, b) => {
      const timeA = parseInt(a.split('-').pop().replace('.pdf', '')) || 0;
      const timeB = parseInt(b.split('-').pop().replace('.pdf', '')) || 0;
      return timeB - timeA;
    })[0];
    
    const cvPath = path.join(uploadsDir, latestPDF);
    
    // Security check: Ensure the resolved path is within uploads directory
    const resolvedPath = path.resolve(cvPath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      console.error('Path traversal attempt detected:', cvPath);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Verify file exists
    if (!fs.existsSync(cvPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'CV file not found' 
      });
    }
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Resume.pdf"');
    
    // Stream the file
    const fileStream = fs.createReadStream(cvPath);
    
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: 'Error downloading file' 
        });
      }
    });
    
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to download CV' 
      });
    }
  }
});

export default router;