import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (password) => {
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', data.token);
        return { success: true };
      } else {
        const errorMsg = data.errors && Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors.map(err => err.msg).join('. ')
          : data.message || 'Invalid credentials';
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Server error' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
