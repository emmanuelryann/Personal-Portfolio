import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { sendContactEmail } from '../config/email.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// Validation rules
const contactValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 100 })
    .withMessage('Subject must be less than 100 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be less than 2000 characters')
];

// POST /api/contact
router.post('/', contactValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, subject, message } = req.body;
    const submission = { 
      id: Date.now().toString(),
      firstName, 
      lastName, 
      email, 
      subject, 
      message,
      date: new Date().toISOString()
    };

    // Save to database
    try {
      const dbPath = path.join(process.cwd(), 'data.json');
      // If running from server root, it might differ, but process.cwd() usually works for npm run dev
      // Better to use relative path logic similar to other files
      // BUT, since we are in module, let's stick to safe path resolution
    } catch (e) {
      console.error('Path resolution error', e);
    }

    // ACTUAL SAVING LOGIC
    // We need to import fs and path at the top
    const dataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data.json');
    const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    db.submissions.unshift(submission); // Add to top
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));

    // Send email
    await sendContactEmail({ firstName, lastName, email, subject, message });

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
});

export default router;