import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(password);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-form admin-login-card">
        <h2 className="admin-login-title">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="admin-login-form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
            />
          </div>
          {error && <p className="admin-login-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`admin-login-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;