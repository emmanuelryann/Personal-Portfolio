import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data.json');

const router = Router();

// Helper to read data
const readData = () => {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
};

// Helper to write data
const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// GET Submissions (Protected ideally, but public for this mvp structure for now)
router.get('/submissions', (req, res) => {
  try {
    const data = readData();
    res.json({ success: true, submissions: data.submissions || [] });
  } catch (error) {
    console.error('Error reading submissions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET Public Content
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json({ success: true, content: data.content });
  } catch (error) {
    console.error('Error reading content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Middleware for auth check (can be expanded)
// Ideally, import verifyToken from middleware here if using JWT
// For this simple implementation, we assume the frontend sends a secret or we rely on session/cookie later.
// But as per plan, we'll implement a simple verifyPassword middleware or similar in a refined auth flow.
// For now, let's keep public GET and protected PUT.

// PUT content (Protected) - Protected by generic auth check we will add to index.js or specific route
router.put('/', (req, res) => {
  try {
    const { section, data } = req.body;
    
    if (!section || !data) {
      return res.status(400).json({ success: false, message: 'Missing section or data' });
    }

    const currentDb = readData();
    
    // Update specific section
    if (currentDb.content[section]) {
      currentDb.content[section] = data;
      writeData(currentDb);
      res.json({ success: true, message: `${section} updated successfully`, content: currentDb.content });
    } else {
      res.status(404).json({ success: false, message: 'Section not found' });
    }

  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
