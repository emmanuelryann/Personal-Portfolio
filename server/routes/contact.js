import { Router } from 'express';
import { sendContactEmail } from '../config/email.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { contactValidation, validate } from '../middleware/validation.js';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'server', 'data.json');

const router = Router();

router.post('/', 
  contactLimiter,
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
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      };

      try {
        const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        if (!db.submissions) {
          db.submissions = [];
        }
        
        db.submissions.unshift(submission);
        
        if (db.submissions.length > 1000) {
          db.submissions = db.submissions.slice(0, 1000);
        }
        
        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
      } catch (dbError) {
        console.error('Database error:', dbError);
      }

      try {
        await sendContactEmail({ firstName, lastName, email, subject, message });
        
        res.status(200).json({
          success: true,
          message: 'Your message has been sent successfully!'
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        res.status(500).json({
          success: false,
          message: 'Message saved to database, but failed to send email notification. We will still see your message!'
        });
      }

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