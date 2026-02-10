import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';
import { contentUpdateValidation, validate } from '../middleware/validation.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data.json');

const router = Router();

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error('Error reading data:', error);
    throw new Error('Database read error');
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
    throw new Error('Database write error');
  }
};

// Helper to prepend WEBSITE_URL to image paths
const prependBaseUrl = (obj) => {
  if (!obj) return obj;
  const baseUrl = process.env.WEBSITE_URL || '';
  
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

router.get('/', apiLimiter, (req, res) => {
  try {
    const data = readData();
    
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
    
    // Prepend base URL to all image paths
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

router.get('/submissions', verifyToken, apiLimiter, (req, res) => {
  try {
    const data = readData();
    
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

router.delete('/submissions/:id', verifyToken, apiLimiter, (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    
    const initialLength = data.submissions?.length || 0;
    data.submissions = (data.submissions || []).filter(sub => sub.id !== id);
    
    if (data.submissions.length === initialLength) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }
    
    writeData(data);
    
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
  (req, res) => {
    try {
      const { section, data } = req.body;
      
      const currentDb = readData();
      
      if (!currentDb.content) {
        currentDb.content = {};
      }
      
      currentDb.content[section] = data;
      currentDb.lastUpdated = new Date().toISOString();
      currentDb.lastUpdatedBy = 'admin';
      
      writeData(currentDb);
      
      res.json({ 
        success: true, 
        message: `${section} updated successfully`,
        updatedSection: section,
        timestamp: currentDb.lastUpdated
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