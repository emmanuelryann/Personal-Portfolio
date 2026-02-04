import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

router.get('/', (req, res) => {
  // Look for a CV file in uploads or public
  const uploadsDir = path.join(__dirname, '../uploads');
  // Try to find a PDF file
  let cvPath = null;
  
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const pdf = files.find(f => f.toLowerCase().endsWith('.pdf'));
    if (pdf) {
      cvPath = path.join(uploadsDir, pdf);
    }
  }

  // Fallback to a default if provided in future
  // For now if no file, return 404
  if (!cvPath || !fs.existsSync(cvPath)) {
    return res.status(404).json({ success: false, message: 'CV not found. Please upload a PDF in the admin panel.' });
  }

  res.download(cvPath, 'Resume.pdf', (err) => {
    if (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).send('Could not download file');
      }
    }
  });
});

export default router;
