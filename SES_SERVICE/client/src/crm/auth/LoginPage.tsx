import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CRMLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/crm/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="crm-login-page">
      {/* Animated background */}
      <div className="crm-login-bg">
        <div className="crm-login-orb crm-login-orb-1" />
        <div className="crm-login-orb crm-login-orb-2" />
        <div className="crm-login-orb crm-login-orb-3" />
        <div className="crm-login-grid" />
      </div>

      <div className="crm-login-container">
        {/* Logo / Brand */}
        <div className="crm-login-brand">
          <div className="crm-login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#logo-grad)" />
              <path d="M12 20L18 14L26 22L20 28L12 20Z" fill="white" fillOpacity="0.9" />
              <path d="M20 12L28 20L26 22L18 14L20 12Z" fill="white" fillOpacity="0.6" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="crm-login-brand-name">Nexus CRM</span>
          </div>
          <p className="crm-login-subtitle">Sign in to your workspace</p>
        </div>

        {/* Login card */}
        <div className="crm-login-card">
          <form onSubmit={handleSubmit} className="crm-login-form">
            {error && (
              <div className="crm-login-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="crm-login-field">
              <label htmlFor="crm-email">Email address</label>
              <div className="crm-login-input-wrap">
                <svg className="crm-login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 7L12 13L22 7" />
                </svg>
                <input
                  id="crm-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="crm-login-field">
              <label htmlFor="crm-password">Password</label>
              <div className="crm-login-input-wrap">
                <svg className="crm-login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="crm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="crm-login-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="crm-login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="crm-login-spinner" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="crm-login-footer">
            <span>Nexus CRM v2.0</span>
            <span>•</span>
            <span>Enterprise</span>
          </div>
        </div>
      </div>

      <style>{`
        .crm-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #030712;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .crm-login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        .crm-login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
        }

        .crm-login-orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.35), transparent 70%);
          top: -10%;
          left: -5%;
          animation: orbit1 20s ease-in-out infinite;
        }

        .crm-login-orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent 70%);
          bottom: -10%;
          right: -5%;
          animation: orbit2 25s ease-in-out infinite;
        }

        .crm-login-orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orbit3 18s ease-in-out infinite;
        }

        @keyframes orbit1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, 40px) scale(1.1); }
          66% { transform: translate(-30px, 60px) scale(0.95); }
        }

        @keyframes orbit2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, -30px) scale(1.05); }
          66% { transform: translate(40px, -50px) scale(0.9); }
        }

        @keyframes orbit3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }

        .crm-login-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .crm-login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 24px;
        }

        .crm-login-brand {
          text-align: center;
          margin-bottom: 32px;
        }

        .crm-login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .crm-login-brand-name {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #c7d2fe, #e9d5ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .crm-login-subtitle {
          color: rgba(148, 163, 184, 0.8);
          font-size: 15px;
          margin: 0;
        }

        .crm-login-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 36px 32px 24px;
          box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 20px 50px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .crm-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .crm-login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 13px;
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .crm-login-field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(203, 213, 225, 0.9);
          margin-bottom: 6px;
        }

        .crm-login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .crm-login-input-icon {
          position: absolute;
          left: 14px;
          color: rgba(148, 163, 184, 0.5);
          pointer-events: none;
        }

        .crm-login-input-wrap input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s ease;
          outline: none;
        }

        .crm-login-input-wrap input:focus {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          background: rgba(255, 255, 255, 0.06);
        }

        .crm-login-input-wrap input::placeholder {
          color: rgba(148, 163, 184, 0.4);
        }

        .crm-login-eye {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: rgba(148, 163, 184, 0.5);
          cursor: pointer;
          padding: 4px;
          display: flex;
          transition: color 0.2s;
        }

        .crm-login-eye:hover {
          color: rgba(203, 213, 225, 0.8);
        }

        .crm-login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }

        .crm-login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .crm-login-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .crm-login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
        }

        .crm-login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .crm-login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .crm-login-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .crm-login-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          color: rgba(100, 116, 139, 0.6);
          font-size: 12px;
        }

        @media (max-width: 480px) {
          .crm-login-container {
            padding: 16px;
          }
          .crm-login-card {
            padding: 28px 20px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CRMLoginPage;
