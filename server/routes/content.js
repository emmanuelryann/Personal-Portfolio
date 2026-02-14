import { Router } from 'express';
import Portfolio from '../models/Portfolio.js';
import { verifyToken } from '../middleware/auth.js';
import { contentUpdateValidation, validate } from '../middleware/validation.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Helper to prepend BACKEND_URL to local image paths
const prependBaseUrl = (obj) => {
  if (!obj) return obj;
  // Use BACKEND_URL for cross-domain resolution (Netlify -> Render)
  const baseUrl = process.env.BACKEND_URL || '';
  
  if (typeof obj === 'string') {
    if (obj.startsWith('/uploads/')) {
      return `${baseUrl}${obj}`;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => prependBaseUrl(item));
  }
  
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = prependBaseUrl(obj[key]);
    }
    return newObj;
  }
  
  return obj;
};

router.get('/', apiLimiter, async (req, res) => {
  try {
    const data = await Portfolio.findOne();
    
    if (!data) {
      return res.status(404).json({ success: false, message: 'No content found' });
    }

    const publicContent = {
      bio: data.content?.bio || {},
      skills: data.content?.skills || [],
      portfolio: data.content?.portfolio || [],
      services: data.content?.services || [],
      experience: data.content?.experience || [],
      education: data.content?.education || [],
      testimonials: data.content?.testimonials || [],
      contactInfo: data.content?.contactInfo || {}
    };
    
    // Resolve local paths for split deployment
    const formattedContent = prependBaseUrl(publicContent);
    
    res.json({ 
      success: true, 
      content: formattedContent 
    });
  } catch (error) {
    console.error('Error reading content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load content' 
    });
  }
});

router.get('/submissions', verifyToken, apiLimiter, async (req, res) => {
  try {
    const data = await Portfolio.findOne();
    if (!data) return res.json({ success: true, submissions: [] });
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const submissions = data.submissions || [];
    const paginatedSubmissions = submissions.slice(startIndex, endIndex);
    
    res.json({ 
      success: true, 
      submissions: paginatedSubmissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(submissions.length / limit),
        totalSubmissions: submissions.length,
        hasMore: endIndex < submissions.length
      }
    });
  } catch (error) {
    console.error('Error reading submissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load submissions' 
    });
  }
});

router.delete('/submissions/:id', verifyToken, apiLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findOne();
    if (!portfolio) return res.status(404).json({ success: false, message: 'Data not found' });
    
    const initialLength = portfolio.submissions?.length || 0;
    portfolio.submissions = (portfolio.submissions || []).filter(sub => sub.id !== id);
    
    if (portfolio.submissions.length === initialLength) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }
    
    await portfolio.save();
    
    res.json({ 
      success: true, 
      message: 'Submission deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete submission' 
    });
  }
});

router.put('/', 
  verifyToken,
  apiLimiter,
  contentUpdateValidation, 
  validate,
  async (req, res) => {
    try {
      const { section, data } = req.body;
      let portfolio = await Portfolio.findOne();
      
      if (!portfolio) {
        portfolio = new Portfolio({ content: {}, adminSettings: { password: 'initial-setup' } });
      }
      
      if (!portfolio.content) portfolio.content = {};
      portfolio.content[section] = data;
      portfolio.adminSettings.lastUpdated = new Date().toISOString();
      portfolio.adminSettings.lastUpdatedBy = 'admin';
      
      await portfolio.save();
      
      res.json({ 
        success: true, 
        message: `${section} updated successfully`,
        updatedSection: section,
        timestamp: portfolio.adminSettings.lastUpdated
      });

    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update content' 
      });
    }
  }
);

export default router;