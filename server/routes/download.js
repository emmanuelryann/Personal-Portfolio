import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Portfolio from '../models/Portfolio.js';

const router = Router();

router.get('/download-cv', async (req, res) => {
  try {
    const data = await Portfolio.findOne();
    
    // If we have a Cloudinary URL in the database, redirect to it
    if (data?.content?.cvUrl) {
      return res.redirect(data.content.cvUrl);
    }

    // Fallback to local file
    const cvPath = path.join(__dirname, '..', 'uploads', 'Mgbeadichie Emmanuel - Resume.pdf');
    res.download(cvPath, 'Mgbeadichie_Emmanuel_Resume.pdf', (err) => {
      if (err) {
        console.error('Error downloading CV:', err);
        res.status(500).json({ success: false, message: 'Failed to download CV' });
      }
    });
  } catch (error) {
    console.error('CV download error:', error);
    res.status(500).json({ success: false, message: 'CV download failed' });
  }
});

export default router;
