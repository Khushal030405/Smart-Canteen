import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import '../styles/Signup.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          adminCode: role === 'admin' ? adminCode : undefined
        })
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch (parseErr) {
        setError('Invalid server response');
        return;
      }

      if (!response.ok) {
        setError(payload.message || 'Signup failed');
        return;
      }

      setSuccess(payload.message || 'Signup successful');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Server error');
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Signup</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            if (e.target.value !== 'admin') {
              setAdminCode('');
            }
          }}
        >
          <option value="user">Regular Customer</option>
          <option value="admin">Administrator</option>
        </select>
        {role === 'admin' && (
          <>
            <input
              type="text"
              placeholder="Admin access code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
            />
            <p className="admin-hint">Use the admin access code provided by Smart Canteen management.</p>
          </>
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Signup</button>
        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}
