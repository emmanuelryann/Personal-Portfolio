import bcrypt from 'bcryptjs';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data.json');

const router = Router();

// Helper to read data (reuse or import utility)
const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));


// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const db = readData();
    
    const isValid = await bcrypt.compare(password, db.admin.passwordHash);

    if (isValid) {
      // In a real app, send a JWT token here
      // For simplicity, we just say "Success" and frontend stores a flag/dummy token
      res.json({ success: true, token: 'admin-authorized' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change Password Endpoint
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = readData();

    // Verify current
    const isValid = await bcrypt.compare(currentPassword, db.admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }

    // Hash new
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Save
    db.admin.passwordHash = newHash;
    writeData(db);

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
