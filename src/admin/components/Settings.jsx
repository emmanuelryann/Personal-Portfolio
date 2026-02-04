import { useState } from 'react';
import { API_ENDPOINTS, authenticatedFetch, getAuthHeaders } from '../../config/api';
import '../styles/Settings.css';

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setIsError(true);
      setTimeout(() => { setMessage(''); setIsError(false); }, 5000);
      return;
    }

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setIsError(true);
      setTimeout(() => { setMessage(''); setIsError(false); }, 5000);
      return;
    }

    setLoading(true);

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.changePassword, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await response.json();

      if (data.success) {
        setMessage('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Reload after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to update password');
        setIsError(true);
        setTimeout(() => { setMessage(''); setIsError(false); }, 5000);
      }
    } catch (error) {
      console.error('Password change failed:', error);
      setMessage('Server error. Please try again.');
      setIsError(true);
      setTimeout(() => { setMessage(''); setIsError(false); }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form settings">
      <div className="settings__card">
        <h3 className="settings__title">Change Admin Password</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="settings__form-group">
            <label className="settings__label">Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="settings__form-group">
            <label className="settings__label">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="settings__form-group">
            <label className="settings__label">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className={`settings__message ${isError ? 'settings__message--error' : 'settings__message--success'}`}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="settings__submit-btn"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;