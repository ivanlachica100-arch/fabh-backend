import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Loader2, Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccessLogin }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Strict client-side format checks prior to API dispatch
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
      // Strict: Letters, spaces, hyphens, and periods only (2 to 50 characters)
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

    setLoading(true);

    try {
      if (isRegister) {
        await register(name.trim(), email.trim().toLowerCase(), password);
        setSuccessMsg('Account created successfully! Launching Dagupan map...');
      } else {
        await login(email.trim().toLowerCase(), password);
        setSuccessMsg('Login successful! Redirecting to Dagupan map...');
      }

      // Smooth delay for visual confirmation before routing
      setTimeout(() => {
        setSuccessMsg('');
        setName('');
        setEmail('');
        setPassword('');
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }, 950);

    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setError('');
    setSuccessMsg('');
    setName('');
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200">
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900">
          {isRegister ? 'Create an Account' : 'Sign In to FABH'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isRegister ? 'Join as a Dagupan college student' : 'Access reviews, smart comparisons, and saved dorms'}
        </p>

        {/* Dynamic Success Toast Banner */}
        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <span>{successMsg}</span>
              <div className="w-full bg-emerald-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-full w-full animate-[pulse_1s_infinite]" />
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback Banner */}
        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Juan Dela Cruz"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Letters and standard spaces only</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="student@upang.phinmaed.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(successMsg)}
            className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs text-slate-500 hover:text-emerald-600 transition cursor-pointer font-medium"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}