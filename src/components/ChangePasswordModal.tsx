import React, { useState } from 'react';
import { UserAccount } from '../types';
import { KeyRound, Check, AlertCircle, ShieldAlert, X } from 'lucide-react';

interface ChangePasswordModalProps {
  currentUser: UserAccount;
  onPasswordChanged: (newPassword: string) => void;
  onClose: () => void;
  isMandatory?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  onPasswordChanged,
  onClose,
  isMandatory = false,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate current password
    if (currentPassword !== currentUser.passwordHash) {
      setError('Current password is incorrect. (Default is admin123)');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === 'admin123') {
      setError('Please choose a different password from the default "admin123".');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    onPasswordChanged(newPassword);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      id="change-password-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-base">
              {isMandatory ? 'Security Requirement: Update Default Password' : 'Change Password'}
            </h3>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="text-amber-200 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isMandatory && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs flex gap-2.5 items-start">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Default Credentials In Use:</strong> For local safety and offline
                protection, please replace the default password (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">admin123</code>)
                with your own personal committee password.
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-700 text-xs flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700 text-xs flex gap-2 items-center">
              <Check className="w-4 h-4 shrink-0" />
              <span>Password successfully updated and saved locally!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password *
            </label>
            <input
              id="input-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password (e.g. admin123)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Secure Password *
            </label>
            <input
              id="input-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <input
              id="input-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {!isMandatory && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              id="btn-save-new-password"
              type="submit"
              disabled={success}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
