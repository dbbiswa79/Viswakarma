import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Lock, ShieldCheck, UserCheck, Key, HelpCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setError('User not found. Try default username "admin"');
      return;
    }

    if (user.passwordHash !== password) {
      setError('Invalid password. (Default password is "admin123")');
      return;
    }

    onLoginSuccess(user);
  };

  const handleQuickLogin = (role: 'admin' | 'secretary' | 'treasurer' | 'auditor') => {
    const user = users.find((u) => u.role === role) || users[0];
    if (user) {
      setUsername(user.username);
      setPassword(user.passwordHash);
      onLoginSuccess(user);
    }
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-xl font-black font-serif uppercase tracking-wide">
            Bishwakarma Puja
          </h2>
          <p className="text-xs text-amber-200 mt-0.5 font-medium">
            Local Desktop Committee Financial Management
          </p>
        </div>

        {/* Credentials reminder badge */}
        <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <span className="font-bold text-amber-900 block mb-0.5">
              Default Administrator Credentials:
            </span>
            Username: <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold text-slate-900">admin</code> &bull; Password:{' '}
            <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold text-slate-900">admin123</code>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-700 text-xs flex gap-2 items-center">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setPassword('admin123')}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer underline"
              >
                Auto-fill default (admin123)
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-2">
            <button
              id="btn-login-submit"
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Log In to Committee Desk
            </button>
          </div>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 mb-2 font-medium">
              Quick role login &bull; <span className="text-amber-800 font-semibold">Admin, Secretary & Treasurer have edit rights:</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors cursor-pointer border border-slate-200"
                title="Admin: Full editing & administrative rights"
              >
                👑 Admin (Editor)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('secretary')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors cursor-pointer border border-slate-200"
                title="Secretary: Full ledger editing & member management"
              >
                📝 Secretary (Editor)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('treasurer')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors cursor-pointer border border-slate-200"
                title="Treasurer: Full accounting & voucher editing"
              >
                💼 Treasurer (Editor)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('auditor')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors cursor-pointer border border-slate-200"
                title="Auditor: Read-only inspection & reporting"
              >
                🔍 Auditor (View-Only)
              </button>
            </div>
          </div>

          {canCancel && onCancel && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
