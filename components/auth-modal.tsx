'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, ArrowRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function persistAuthData(loginData: any) {
  if (typeof window === 'undefined' || !loginData) return;
  if (loginData.user.accessToken) {
    localStorage.setItem('access_token', loginData.user.accessToken);
  }
  if (loginData.user.refreshToken) {
    localStorage.setItem('refresh_token', loginData.user.refreshToken);
  }
  if (loginData.user.user.userId || loginData.user.user.id) {
    localStorage.setItem('userId', loginData.user.user.userId || loginData.user.user.id);
  }
  if (loginData.user.user.fullName) {
    localStorage.setItem('userName', loginData.user.user.fullName);
  }
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
      onOpenChange(false);
    } catch (error) {
      console.error('Login failed', error);
      setMessage('Google login failed. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    onOpenChange(false);
    router.push('/auth/reset');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json().catch(() => null);

      if (!loginResponse.ok || !loginData?.success) {
        setMessage(loginData?.message || 'Invalid credentials');
        setIsError(true);
        return;
      }

      persistAuthData(loginData);

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setMessage('Invalid credentials. Please try again.');
        setIsError(true);
      } else {
        setMessage('Welcome back! Redirecting…');
        setIsError(false);
        setTimeout(() => {
          onOpenChange(false);
          router.push('/');
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Something went wrong. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .auth-overlay [data-radix-dialog-overlay] {
          background: rgba(8, 8, 12, 0.75);
          backdrop-filter: blur(12px);
        }

        .auth-dialog-content {
          font-family: 'DM Sans', sans-serif;
          background: #0d0d14;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 0;
          overflow: hidden;
          max-width: 420px;
          width: 100%;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 120px rgba(99,102,241,0.06);
        }

        .auth-top-strip {
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #818cf8, #c084fc);
        }

        .auth-inner {
          padding: 36px 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .auth-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          font-weight: 400;
          color: #f1f1f8;
          letter-spacing: -0.3px;
          line-height: 1.2;
          margin: 0 0 6px;
        }

        .auth-subheading {
          font-size: 13.5px;
          color: rgba(255,255,255,0.38);
          font-weight: 400;
          letter-spacing: 0.01em;
          margin: 0 0 28px;
        }

        .auth-message {
          font-size: 13px;
          padding: 11px 14px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .auth-message.error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
        }

        .auth-message.success {
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.25);
          color: #34d399;
        }

        .auth-field {
          position: relative;
          margin-bottom: 14px;
        }

        .auth-field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25);
          width: 16px;
          height: 16px;
          pointer-events: none;
          transition: color 0.2s;
        }

        .auth-field.focused .auth-field-icon {
          color: #818cf8;
        }

        .auth-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #f1f1f8;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .auth-input::placeholder {
          color: rgba(255,255,255,0.22);
        }

        .auth-input:focus {
          border-color: rgba(129,140,248,0.5);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .auth-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-forgot {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 22px;
          margin-top: -4px;
        }

        .auth-forgot-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          color: rgba(129,140,248,0.7);
          padding: 0;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }

        .auth-forgot-btn:hover {
          color: #818cf8;
        }

        .auth-btn-primary {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
          margin-bottom: 20px;
        }

        .auth-btn-primary:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.4);
        }

        .auth-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-btn-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .auth-divider-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        .auth-btn-google {
          width: 100%;
          height: 48px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          color: rgba(255,255,255,0.75);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin-bottom: 28px;
        }

        .auth-btn-google:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: #fff;
        }

        .auth-btn-google:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .google-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .auth-footer {
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.22);
          line-height: 1.6;
        }

        .auth-footer a {
          color: rgba(129,140,248,0.65);
          text-decoration: none;
          transition: color 0.2s;
        }

        .auth-footer a:hover {
          color: #818cf8;
        }

        .auth-footer .sep {
          margin: 0 4px;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="auth-dialog-content sm:max-w-[420px] p-0 gap-0 border-0 bg-transparent">
          {/* Gradient accent strip */}
          <div className="auth-top-strip" />

          <div className="auth-inner">
            <DialogHeader className="text-left space-y-0 mb-0">
              <DialogTitle className="auth-heading">Welcome back</DialogTitle>
              <p className="auth-subheading">Sign in to continue to your account</p>
            </DialogHeader>

            {/* Feedback message */}
            {message && (
              <div className={`auth-message ${isError ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            {/* Email field */}
            <div
              className={`auth-field ${focusedField === 'email' ? 'focused' : ''}`}
            >
              <Mail className="auth-field-icon" />
              <input
                className="auth-input"
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={isLoading}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Password field */}
            <div
              className={`auth-field ${focusedField === 'password' ? 'focused' : ''}`}
            >
              <Lock className="auth-field-icon" />
              <input
                className="auth-input"
                id="password"
                type="password"
                placeholder="Password"
                disabled={isLoading}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Forgot password */}
            <div className="auth-forgot">
              <button
                type="button"
                className="auth-forgot-btn"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isLoading}
              onClick={handleSubmit as any}
            >
              {isLoading ? (
                <Loader2 className="spin" style={{ width: 16, height: 16 }} />
              ) : (
                <>
                  Sign In
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or</span>
              <div className="auth-divider-line" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              className="auth-btn-google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="spin" style={{ width: 16, height: 16 }} />
              ) : (
                <>
                  <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Footer */}
            <div className="auth-footer">
              By continuing, you agree to our
              <span className="sep" />
              <Link href="/terms">Terms of Service</Link>
              <span className="sep">&</span>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}