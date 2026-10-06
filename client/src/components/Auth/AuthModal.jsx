import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { 
  X, 
  Loader2, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccessLogin }) {
  const { login, checkCurrentUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // OTP Verification Step: null | 'register_otp' | 'device_otp'
  const [otpMode, setOtpMode] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Hydrate remembered email and reset fields whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setPassword('');
      setOtpMode(null);
      setOtpCode('');
      setShowPassword(false);

      const savedEmail = localStorage.getItem('fabh_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      } else {
        setEmail('');
        setRememberMe(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateInputs = () => {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (isRegister) {
      const cleanName = name.trim();
      const nameRegex = /^[a-zA-Z\s.-]{2,50}$/;

      if (!cleanName) {
        setError('Full name is required.');
        return false;
      }
      if (!nameRegex.test(cleanName)) {
        setError('Name can only contain letters, spaces, hyphens, and periods (no numbers or special symbols).');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateInputs()) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!isRegister && rememberMe) {
      localStorage.setItem('fabh_remembered_email', cleanEmail);
    } else if (!isRegister && !rememberMe) {
      localStorage.removeItem('fabh_remembered_email');
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.post('/auth/send-register-otp', {
          name: name.trim(),
          email: cleanEmail,
          password,
        });

        if (res.data.success) {
          setOtpMode('register_otp');
          setError('');
          setSuccessMsg('');
        }
      } else {
        const res = await api.post('/auth/login', {
          email: cleanEmail,
          password,
        });

        if (res.data.requireDeviceOtp) {
          setOtpMode('device_otp');
          setError('');
          setSuccessMsg('');
        } else {
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
          }
          await login(cleanEmail, password);
          setSuccessMsg('Login successful! Redirecting to Dagupan map...');

          setTimeout(() => {
            handleModalClose();
            if (onSuccessLogin) onSuccessLogin();
          }, 950);
        }
      }
    } catch (err) {
      console.error('Submit auth error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const endpoint = otpMode === 'register_otp' 
        ? '/auth/verify-register-otp' 
        : '/auth/verify-device-otp';

      const res = await api.post(endpoint, {
        email: cleanEmail,
        otp: otpCode.trim(),
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      if (checkCurrentUser) {
        await checkCurrentUser();
      }

      setSuccessMsg(
        otpMode === 'register_otp' 
          ? 'Account verified! Launching Dagupan map...' 
          : 'Device verified! Logging in...'
      );

      setTimeout(() => {
        handleModalClose();
        if (onSuccessLogin) onSuccessLogin();
      }, 950);
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (otpMode === 'register_otp') {
        await api.post('/auth/send-register-otp', {
          name: name.trim(),
          email: cleanEmail,
          password,
        });
      } else {
        await api.post('/auth/login', {
          email: cleanEmail,
          password,
        });
      }
      setSuccessMsg('A fresh verification code has been dispatched.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setError('');
    setSuccessMsg('');
    setName('');
    setPassword('');
    setOtpMode(null);
    setOtpCode('');
    setShowPassword(false);
    
    if (!localStorage.getItem('fabh_remembered_email')) {
      setEmail('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 transition-colors">
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {otpMode ? (
          <div>
            <button
              type="button"
              onClick={() => {
                setOtpMode(null);
                setOtpCode('');
                setError('');
                setSuccessMsg('');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-2 cursor-pointer hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Enter Verification Code
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter the 6-digit code sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isRegister ? 'Create an Account' : 'Sign In to FABH'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isRegister ? 'Join as a Dagupan college student' : 'Access reviews, smart comparisons, and saved dorms'}
            </p>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex-1">
              <span>{successMsg}</span>
              <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-full w-full animate-[pulse_1s_infinite]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {otpMode ? (
          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4" autoComplete="off">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                6-Digit Security Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ''));
                    if (error) setError('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-center tracking-[0.4em] font-mono font-bold text-base border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:tracking-normal placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-center">
                Code expires in 10 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Verify & Complete Login
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={handleResendOtp}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer font-medium"
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3" autoComplete="off">
            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="e.g., Juan Dela Cruz"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Letters and standard spaces only</p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="student@upang.phinmaed.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Remember Me Option (Sign In Only) */}
            {!isRegister && (
              <div className="flex items-center justify-between pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Remember email</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isRegister ? 'Continue to Email Verification' : 'Sign In'}
            </button>
          </form>
        )}

        {!otpMode && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessMsg('');
                setPassword('');
              }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer font-medium"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}