import { Router } from 'express';
import { sendContactEmail } from '../config/email.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { contactValidation, validate } from '../middleware/validation.js';
import Portfolio from '../models/Portfolio.js';

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
        date: new Date(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      };

      // Save to MongoDB
      try {
        const portfolio = await Portfolio.findOne();
        if (portfolio) {
          if (!portfolio.submissions) portfolio.submissions = [];
          portfolio.submissions.unshift(submission);
          
          if (portfolio.submissions.length > 1000) {
            portfolio.submissions = portfolio.submissions.slice(0, 1000);
          }
          
          await portfolio.save();
        }
      } catch (dbError) {
        console.error('Database error saving submission:', dbError);
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