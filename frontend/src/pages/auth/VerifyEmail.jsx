import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token missing in URL.');
      return;
    }

    authAPI
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification token is invalid or has expired.');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: status === 'success' ? 'var(--success-text)' : status === 'error' ? 'var(--danger-text)' : 'var(--primary-600)' }}>
            {status === 'verifying' ? (
              <Clock size={24} />
            ) : status === 'success' ? (
              <CheckCircle2 size={24} />
            ) : (
              <XCircle size={24} />
            )}
          </div>
          <h1 className="auth-title">Email Verification</h1>
          <p className="auth-subtitle">Dayflow HRMS Account Activation</p>
        </div>

        {status === 'verifying' && (
          <div style={{ padding: '20px 0' }}>
            <div className="spinner-lg" style={{ margin: '0 auto 16px' }} />
            <p className="text-secondary text-sm">Verifying your token, please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="alert alert-success">{message}</div>
            <Link to="/login" className="btn btn-primary btn-full btn-lg mt-4">
              Sign In to Your Account <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="alert alert-error">{message}</div>
            <Link to="/login" className="btn btn-secondary btn-full mt-4">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
