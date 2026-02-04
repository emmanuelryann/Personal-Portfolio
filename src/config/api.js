// API Configuration
// This centralizes all API endpoints and base URLs

// const getBaseURL = () => {
//   // Check if we're in production or development
//   if (import.meta.env.PROD) {
//     // Production: Use your deployed backend URL
//     return import.meta.env.VITE_API_URL || 'https://api.yourdomain.com';
//   }
//   // Development: Use localhost
//   return import.meta.env.VITE_API_URL || 'http://localhost:5173';
// };

const getBaseURL = () => {
  return import.meta.env.WEBSITE_URL || 'http://localhost:5001';
};

export const API_BASE_URL = getBaseURL();

// API Endpoints
export const API_ENDPOINTS = {
  // Content
  content: `${API_BASE_URL}/api/content`,
  submissions: `${API_BASE_URL}/api/content/submissions`,
  
  // Contact
  contact: `${API_BASE_URL}/api/contact`,
  
  // Auth
  login: `${API_BASE_URL}/api/auth/login`,
  changePassword: `${API_BASE_URL}/api/auth/change-password`,
  verifyToken: `${API_BASE_URL}/api/auth/verify`,
  
  // Upload
  uploadImage: `${API_BASE_URL}/api/upload/image`,
  uploadCV: `${API_BASE_URL}/api/upload/cv`,
  
  // Download
  downloadCV: `${API_BASE_URL}/api/download-cv`,
  
  // Static files (uploads)
  uploads: (filename) => `${API_BASE_URL}/uploads/${filename}`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function for authenticated fetch
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  
  // If unauthorized, clear token and redirect to login
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    // Optionally redirect to login
    // window.location.href = '/admin/login';
  }
  
  return response;
};

export default API_BASE_URL;