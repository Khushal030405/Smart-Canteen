import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getApiUrl } from '../utils/api';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch (parseErr) {
        setError('Invalid server response');
        return;
      }

      if (!response.ok) {
        setError(payload.message || 'Login failed');
        return;
      }

      if (!payload.token || !payload.user) {
        setError('Unexpected server response');
        return;
      }

      login(payload);
      notify('Logged in successfully', 'success');
    } catch (err) {
      setError(err.message || 'Server error');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p className="auth-switch">
          New to Smart Canteen?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => navigate('/signup')}
          >
            Create an account
          </button>
        </p>
      </form>
    </div>
  );
}
