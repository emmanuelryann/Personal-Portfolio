import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get('/download-cv', (req, res) => {
  try {
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
