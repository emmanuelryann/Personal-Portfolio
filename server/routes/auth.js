import bcrypt from 'bcryptjs';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { loginValidation, passwordChangeValidation, validate } from '../middleware/validation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data.json');

const router = Router();

const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

router.post('/login', authLimiter, loginValidation, validate, async (req, res) => {
  try {
    const { password } = req.body;
    const db = readData();
    
    const isValid = await bcrypt.compare(password, db.admin.passwordHash);

    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken({ 
      role: 'admin',
      timestamp: Date.now()
    });

    res.json({ 
      success: true, 
      token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.post('/change-password', verifyToken, authLimiter, passwordChangeValidation,  validate, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const db = readData();

      const isValid = await bcrypt.compare(currentPassword, db.admin.passwordHash);
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      const isSamePassword = await bcrypt.compare(newPassword, db.admin.passwordHash);
      if (isSamePassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'New password must be different from current password' 
        });
      }

      const salt = await bcrypt.genSalt(12);
      const newHash = await bcrypt.hash(newPassword, salt);

      db.admin.passwordHash = newHash;
      db.admin.lastPasswordChange = new Date().toISOString();
      writeData(db);

      res.json({ 
        success: true, 
        message: 'Password updated successfully' 
      });

    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
);

router.get('/verify', verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    valid: true,
    role: req.admin.role 
  });
});

export default router;