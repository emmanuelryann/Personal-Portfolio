import { useState } from 'react';

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

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setIsError(true);
      setTimeout(() => { setMessage(''); setIsError(false); }, 5000);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();

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
      setMessage('Server error. Please try again.');
      setIsError(true);
      setTimeout(() => { setMessage(''); setIsError(false); }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px' }} className="admin-form">
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Change Admin Password</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <p style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              borderRadius: '4px',
              backgroundColor: isError ? '#ffebee' : '#e8f5e9',
              color: isError ? '#c62828' : '#2e7d32'
            }}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: '#2c3e50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
