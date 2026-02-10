import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { apiLimiter } from '../middleware/rateLimiter.js';

const uploadsDir = path.join(process.cwd(), 'server', 'uploads');

const router = Router();

router.get('/', apiLimiter, (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({ 
        success: false, 
        message: 'No CV available for download.' 
      });
    }
    
    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'CV not found. Please check back later.' 
      });
    }
    
    const latestPDF = pdfFiles.sort((a, b) => {
      const timeA = parseInt(a.split('-').pop().replace('.pdf', '')) || 0;
      const timeB = parseInt(b.split('-').pop().replace('.pdf', '')) || 0;
      return timeB - timeA;
    })[0];
    
    const cvPath = path.join(uploadsDir, latestPDF);
    
    const resolvedPath = path.resolve(cvPath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      console.error('Path traversal attempt detected:', cvPath);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    if (!fs.existsSync(cvPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'CV file not found' 
      });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Resume.pdf"');
    
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