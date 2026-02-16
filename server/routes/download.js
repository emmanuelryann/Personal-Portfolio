import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Portfolio from '../models/Portfolio.js';

const router = Router();

router.get('/download-cv', async (req, res) => {
  try {
    const data = await Portfolio.findOne();
    
    if (!data?.content?.cvUrl) {
      return res.status(404).json({ 
        success: false, 
        message: 'CV not available' 
      });
    }

    // Fetch from Cloudinary
    const response = await fetch(data.content.cvUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch CV');
    }

    // Force proper filename with extension
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Mgbeadichie_Emmanuel_Resume.pdf"');
    
    // Stream the PDF
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('CV download error:', error);
    res.status(500).json({ success: false, message: 'Failed to download CV' });
  }
});

export default router;