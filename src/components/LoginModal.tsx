import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Lock, Key, HelpCircle, Eye, EyeOff, Globe, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  onLoginSuccess,
  onCancel,
  canCancel = false,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      setError('Please enter or select a valid username.');
      return;
    }

    if (!password) {
      setError('Password is required before login. Please enter your account password.');
      return;
    }

    const user = users.find(
      (u) => u.username.toLowerCase() === trimmedUsername
    );

    if (!user) {
      setError(`User "${username}" not found. Available accounts: admin, secretary, treasurer, editor, auditor.`);
      return;
    }

    if (user.passwordHash !== password) {
      setError(`Invalid password for account "${user.username}". Default password is "admin123" (unless changed). Please check and try again.`);
      return;
    }

    onLoginSuccess(user);
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-amber-300 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Banner with Online Mode Branding */}
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-xl font-black font-serif uppercase tracking-wide">
            Bishwakarma Puja
          </h2>
          <p className="text-xs text-amber-200 mt-1 font-medium flex items-center justify-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Online Committee Financial Portal & Management Desk</span>
          </p>
        </div>

        {/* Security notice highlighting admin123 default password */}
        <div className="bg-amber-50 px-5 py-3 border-b border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Default Password for ALL Accounts: <span className="font-mono bg-amber-200/80 px-1.5 py-0.5 rounded text-slate-900">admin123</span></span>
          </div>
          <p className="text-[11px] text-slate-600 pl-6">
            All roles (admin, secretary, treasurer, editor, auditor) start with password <code className="font-mono font-bold text-slate-800">admin123</code> and can change their password anytime after signing in.
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs flex gap-2 items-center">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username selection / input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Account / Username *
            </label>
            <div className="space-y-2">
              <select
                id="login-username-select"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.username} — {u.fullName} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>

              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Or type username (admin, secretary, treasurer, editor, auditor)"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Password input with Eye option */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter password (default: admin123)"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                id="btn-toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Checkbox option to show password */}
            <label
              htmlFor="checkbox-show-password"
              className="flex items-center gap-2 mt-2 text-xs text-slate-700 cursor-pointer select-none font-medium"
            >
              <input
                id="checkbox-show-password"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
              <span>Show password</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-login-submit"
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Authenticate & Log In
            </button>
          </div>

          {/* Registered Roles reference list */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1.5">
              <span>Registered Accounts:</span>
              <span className="text-amber-700 font-mono font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Default: admin123
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
              <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <strong className="text-slate-800">admin</strong> (Full Admin)
              </div>
              <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <strong className="text-slate-800">secretary</strong> (Editor)
              </div>
              <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <strong className="text-slate-800">treasurer</strong> (Editor)
              </div>
              <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <strong className="text-slate-800">editor</strong> (Editor)
              </div>
              <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200 col-span-2">
                <strong className="text-slate-800">auditor</strong> (View-Only Audit)
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 italic text-center">
              All roles share the default password <strong className="text-slate-600 font-mono">admin123</strong> and can change their password at any time.
            </p>
          </div>

          {canCancel && onCancel && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel & Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
