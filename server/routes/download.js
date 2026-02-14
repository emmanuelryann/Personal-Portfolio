import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Portfolio from '../models/Portfolio.js';

const router = Router();

router.get('/download-cv', async (req, res) => {
  try {
    const data = await Portfolio.findOne();
    
    if (data?.content?.cvUrl) {
      return res.redirect(data.content.cvUrl);
    }

    const cvPath = path.join(__dirname, '..', 'uploads', 'Mgbeadichie Emmanuel - Resume.pdf');
    
    if (!fs.existsSync(cvPath)) {
      console.error('CV file not found:', cvPath);
      return res.status(404).json({ success: false, message: 'CV file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Mgbeadichie_Emmanuel_Resume.pdf"');
    
    res.sendFile(cvPath, (err) => {
      if (err && !res.headersSent) {
        console.error('Error sending CV:', err);
        res.status(500).json({ success: false, message: 'Failed to view CV' });
      }
    });
  } catch (error) {
    console.error('CV view error:', error);
    res.status(500).json({ success: false, message: 'CV view failed' });
  }
});

export default router;