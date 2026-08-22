import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to Dayflow backend API at http://localhost:5050. Please ensure the backend is running.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Layers size={24} />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to Dayflow HRMS</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              <>
                Sign in to Dashboard <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
