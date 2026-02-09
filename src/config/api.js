// API Configuration

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    // Determine base URL dynamically or hardcode to function path
    // Using relative path to function ensures it works on same domain
    return '/.netlify/functions';
  }
  return 'http://localhost:5001';
};

export const API_BASE_URL = getBaseURL();

// API Endpoints
export const API_ENDPOINTS = {
  content: `${API_BASE_URL}/api/content`,
  submissions: `${API_BASE_URL}/api/content/submissions`,

  contact: `${API_BASE_URL}/api/contact`,

  login: `${API_BASE_URL}/api/auth/login`,
  changePassword: `${API_BASE_URL}/api/auth/change-password`,
  verifyToken: `${API_BASE_URL}/api/auth/verify`,

  uploadImage: `${API_BASE_URL}/api/upload/image`,
  uploadCV: `${API_BASE_URL}/api/upload/cv`,
  
  downloadCV: `${API_BASE_URL}/api/download-cv`,
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
  
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    
    window.location.href = '/admin/login';
  }
  
  return response;
};

export const formatValidationErrors = (data) => {
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map(err => err.msg).join('. ');
  }
  return data.message || 'An error occurred';
};

export default API_BASE_URL;