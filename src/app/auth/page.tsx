'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function AuthPage() {
  const router = useRouter();
  const { login } = useUser();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    // Simple auth mock flow
    setTimeout(() => {
      if (email.trim() === '' || password.trim() === '') {
        setErrorMsg('Please fill in email and password.');
        setSubmitting(false);
        return;
      }

      if (isLoginView) {
        // Mock Login
        const parsedName = email.split('@')[0];
        const formattedName = parsedName.charAt(0).toUpperCase() + parsedName.slice(1);
        login(formattedName, email);
      } else {
        // Mock Register
        if (name.trim() === '') {
          setErrorMsg('Please enter your full name.');
          setSubmitting(false);
          return;
        }
        login(name, email);
      }

      setSubmitting(false);
      router.push('/profile');
    }, 800);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <h2 className="auth-title">
          {isLoginView ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className="auth-desc">
          {isLoginView 
            ? 'Sign in to order food, track packages, and edit saved addresses.' 
            : 'Register for fast deliveries, promo coupons, and order histories.'
          }
        </p>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: '#FFEBEE',
          color: '#D32F2F',
          border: '1px solid #FFCDD2',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLoginView && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Rachal Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLoginView}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="e.g. rachal@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {!isLoginView && (
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. (821) 784-621"
              value={phoneVal}
              onChange={(e) => setPhoneVal(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="form-submit-btn" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="admin-pulse" style={{ width: '12px', height: '12px', background: 'white' }}></div>
              Authenticating Account...
            </>
          ) : (
            isLoginView ? 'Sign In' : 'Register Account'
          )}
        </button>
      </form>

      <div className="auth-toggle-prompt">
        {isLoginView ? "Don't have an account yet? " : "Already have an account? "}
        <button 
          type="button" 
          className="auth-toggle-btn"
          onClick={() => {
            setIsLoginView(!isLoginView);
            setErrorMsg('');
          }}
        >
          {isLoginView ? 'Register' : 'Sign In'}
        </button>
      </div>

      <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
          Tip: You can use any mockup email/password for instant login capability in this demo sandbox.
        </p>
      </div>
    </div>
  );
}
