import { Router } from 'express';
import { sendContactEmail } from '../config/email.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { contactValidation, validate } from '../middleware/validation.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data.json');

const router = Router();

// POST /api/contact - PUBLIC with strict rate limiting
router.post('/', 
  contactLimiter, // 5 submissions per hour
  contactValidation, 
  validate, 
  async (req, res) => {
    try {
      const { firstName, lastName, email, subject, message } = req.body;
      
      const submission = { 
        id: Date.now().toString(),
        firstName, 
        lastName, 
        email, 
        subject, 
        message,
        date: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress, // Track IP for spam prevention
        userAgent: req.get('user-agent')
      };

      // Save to database
      try {
        const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        // Initialize submissions array if it doesn't exist
        if (!db.submissions) {
          db.submissions = [];
        }
        
        db.submissions.unshift(submission); // Add to top
        
        // Keep only last 1000 submissions to prevent file bloat
        if (db.submissions.length > 1000) {
          db.submissions = db.submissions.slice(0, 1000);
        }
        
        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB save fails - email is more important
      }

      // Send email
      try {
        await sendContactEmail({ firstName, lastName, email, subject, message });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Log but don't fail the request
        // You might want to implement a retry mechanism here
      }

      res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully!'
      });

    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      });
    }
  }
);

export default router;