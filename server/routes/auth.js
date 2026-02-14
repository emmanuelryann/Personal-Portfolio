import bcrypt from 'bcryptjs';
import { Router } from 'express';
import Portfolio from '../models/Portfolio.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { loginValidation, passwordChangeValidation, validate } from '../middleware/validation.js';

const router = Router();

router.post('/login', authLimiter, loginValidation, validate, async (req, res) => {
  try {
    const { password } = req.body;
    const portfolio = await Portfolio.findOne();
    
    if (!portfolio || !portfolio.adminSettings || !portfolio.adminSettings.password) {
      return res.status(401).json({ success: false, message: 'Admin not configured' });
    }

    const isValid = await bcrypt.compare(password, portfolio.adminSettings.password);

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

router.post('/change-password', verifyToken, authLimiter, passwordChangeValidation, validate, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const portfolio = await Portfolio.findOne();

      const isValid = await bcrypt.compare(currentPassword, portfolio.adminSettings.password);
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      const isSamePassword = await bcrypt.compare(newPassword, portfolio.adminSettings.password);
      if (isSamePassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'New password must be different from current password' 
        });
      }

      const salt = await bcrypt.genSalt(12);
      const newHash = await bcrypt.hash(newPassword, salt);

      portfolio.adminSettings.password = newHash;
      portfolio.adminSettings.lastPasswordChange = new Date().toISOString();
      await portfolio.save();

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
    role: req.admin?.role || 'admin'
  });
});

export default router;