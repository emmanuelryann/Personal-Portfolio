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

    return res.status(404).json({ 
      success: false, 
      message: 'CV not available' 
    });
  } catch (error) {
    console.error('CV download error:', error);
    res.status(500).json({ success: false, message: 'Failed to download CV' });
  }
});

export default router;