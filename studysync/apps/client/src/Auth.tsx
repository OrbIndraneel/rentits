import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw 
} from 'lucide-react';
import logoImg from './assets/logo.png';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';

interface AuthProps {
  onLoginSuccess: () => void;
  onStartGuestMode: () => void;
  onBackToHome?: () => void;
}

export default function Auth({ onLoginSuccess, onStartGuestMode, onBackToHome }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (!displayName.trim()) {
        setError("Please enter a username.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onLoginSuccess();
      } else {
        // Register
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: displayName.trim()
          });
        }
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let friendlyMessage = err.message || "An authentication error occurred.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = "Invalid email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email is already in use.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "Password is too weak (min 6 characters).";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    onStartGuestMode();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-secondary)'
    }} id="auth-page-container">
      {/* Visual background ambient glow spots */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(156, 141, 246, 0.05) 0%, transparent 70%)',
        top: '-10%',
        left: '10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(242, 110, 86, 0.05) 0%, transparent 70%)',
        bottom: '-10%',
        right: '10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Main Premium Light Card */}
      <div 
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          backgroundColor: 'var(--bg-canvas)',
          border: '1px solid var(--border-light)',
          borderRadius: '24px',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.04)',
          animation: 'slideUp 0.4s ease-out'
        }}
        id="auth-card"
      >
        {onBackToHome && (
          <button 
            type="button"
            onClick={onBackToHome}
            style={{
              alignSelf: 'flex-start',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0',
              marginTop: '-10px',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-coral)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            id="auth-back-to-home"
          >
            &larr; Back to Home
          </button>
        )}
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <img 
            src={logoImg} 
            alt="StudySync Logo" 
            style={{ 
              height: '72px', 
              width: '72px', 
              objectFit: 'contain', 
              alignSelf: 'center', 
              marginBottom: '4px' 
            }} 
          />
          <h2 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '32px', 
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            StudySync
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Collaborative portal for real-time study & rentals
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-muted)'
        }} id="auth-tabs">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isLogin ? 'white' : 'transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: isLogin ? '600' : '500',
              cursor: 'pointer',
              boxShadow: isLogin ? '0 4px 12px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
            type="button"
            id="tab-login"
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: !isLogin ? 'white' : 'transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: !isLogin ? '600' : '500',
              cursor: 'pointer',
              boxShadow: !isLogin ? '0 4px 12px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
            type="button"
            id="tab-register"
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(217, 78, 78, 0.05)',
            border: '1px solid rgba(217, 78, 78, 0.15)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: 'var(--accent-red)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }} id="auth-error-msg">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="auth-form">
          
          {/* Username (Register only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{ width: '100%', paddingLeft: '40px' }}
                  required
                  id="auth-input-username"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="input-text"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
                required
                id="auth-input-email"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="input-text"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
                required
                id="auth-input-password"
              />
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="input-text"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: '40px' }}
                  required
                  id="auth-input-confirm-password"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
            id="auth-btn-submit"
          >
            {loading ? (
              <RefreshCw className="glow-pulse" size={16} style={{ animation: 'spin 2s linear infinite' }} />
            ) : isLogin ? (
              <>Sign In <ArrowRight size={16} /></>
            ) : (
              <>Register <Sparkles size={16} /></>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-muted)' }} />
          <span>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-muted)' }} />
        </div>

        {/* Guest Path */}
        <button
          type="button"
          onClick={handleGuestMode}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '12px' }}
          id="auth-btn-guest"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
