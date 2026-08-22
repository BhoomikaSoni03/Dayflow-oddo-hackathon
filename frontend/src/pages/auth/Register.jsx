import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Layers, UserPlus, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      setSuccess(
        `Registration successful! Check the server console for your verification link, or use token: ${data.verificationToken}`
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Layers size={24} />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Get started with Dayflow HRMS</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
            <button
              className="btn btn-secondary btn-sm mt-3"
              onClick={() => navigate('/login')}
            >
              Go to Login <ArrowRight size={14} />
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-first">
                  First Name
                </label>
                <input
                  id="reg-first"
                  type="text"
                  className="form-input"
                  placeholder="Priya"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-last">
                  Last Name
                </label>
                <input
                  id="reg-last"
                  type="text"
                  className="form-input"
                  placeholder="Sharma"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-empid">
                Employee ID
              </label>
              <input
                id="reg-empid"
                type="text"
                className="form-input"
                placeholder="e.g. EMP004"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Work Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">
                Account Role
              </label>
              <select
                id="reg-role"
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin / HR Officer</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-pass">
                  Password
                </label>
                <input
                  id="reg-pass"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Create Account
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
