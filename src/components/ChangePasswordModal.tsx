import React, { useState } from 'react';
import { UserAccount } from '../types';
import { KeyRound, Check, AlertCircle, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';

interface ChangePasswordModalProps {
  currentUser: UserAccount;
  targetUser?: UserAccount | null;
  allUsers?: UserAccount[];
  onPasswordChanged: (targetId: string, newPassword: string) => void;
  onClose: () => void;
  isMandatory?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  targetUser: propTargetUser,
  allUsers,
  onPasswordChanged,
  onClose,
  isMandatory = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    propTargetUser?.id || currentUser.id
  );

  const activeTarget: UserAccount =
    (allUsers && allUsers.find((u) => u.id === selectedUserId)) ||
    propTargetUser ||
    currentUser;

  const isChangingSelf = activeTarget.id === currentUser.id;
  const isAdminResettingOther = currentUser.role === 'admin' && !isChangingSelf;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If changing own password, verify current password
    if (!isAdminResettingOther) {
      if (currentPassword !== activeTarget.passwordHash) {
        setError(`Current password for "${activeTarget.username}" is incorrect. (Default password is "admin123" if not previously changed).`);
        return;
      }
    }

    if (!newPassword || newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    onPasswordChanged(activeTarget.id, newPassword);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1300);
  };

  const isVisibleCurrent = showAllPasswords || showCurrentPassword;
  const isVisibleNew = showAllPasswords || showNewPassword;
  const isVisibleConfirm = showAllPasswords || showConfirmPassword;

  return (
    <div
      id="change-password-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-amber-300 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-200" />
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isAdminResettingOther ? `Reset Password: ${activeTarget.username}` : 'Change Password'}
              </h3>
              <p className="text-[11px] text-amber-200">
                Authorized user password update & security settings
              </p>
            </div>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="text-amber-200 hover:text-white p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target User Info & Selector if Admin */}
          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Account: <span className="font-mono text-amber-900">{activeTarget.username}</span> ({activeTarget.role.toUpperCase()})
                </div>
                <div className="text-[11px] text-slate-600">{activeTarget.fullName}</div>
              </div>
            </div>

            {currentUser.role === 'admin' && allUsers && allUsers.length > 1 && (
              <select
                id="select-password-target-user"
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setError(null);
                  setCurrentPassword('');
                }}
                className="text-xs px-2 py-1 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 text-xs flex gap-2 items-start font-semibold">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div>Password for "{activeTarget.username}" updated and saved successfully!</div>
                <div className="text-[11px] text-emerald-600 font-normal font-mono mt-0.5">
                  Security event logged with IP address and exact timestamp in audit trail.
                </div>
              </div>
            </div>
          )}

          {/* Current Password - not required if Admin is resetting another user */}
          {!isAdminResettingOther && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password *
                <span className="text-[11px] font-normal text-slate-500 ml-1.5 font-sans">
                  (Default is <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-semibold">admin123</code>)
                </span>
              </label>
              <div className="relative">
                <input
                  id="input-current-password"
                  type={isVisibleCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter current password (default: admin123)"
                  className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title={isVisibleCurrent ? 'Hide password' : 'Show password'}
                >
                  {isVisibleCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {isAdminResettingOther && (
            <div className="text-[11px] text-amber-800 bg-amber-100/60 px-3 py-1.5 rounded-lg">
              👑 <strong>Admin Privilege:</strong> You can set a new password directly for <strong>{activeTarget.username}</strong> without entering their current password.
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                id="input-new-password"
                type={isVisibleNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter new secure password (min 4 characters)"
                className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title={isVisibleNew ? 'Hide password' : 'Show password'}
              >
                {isVisibleNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                id="input-confirm-password"
                type={isVisibleConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Re-type new password"
                className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title={isVisibleConfirm ? 'Hide password' : 'Show password'}
              >
                {isVisibleConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Eye option to show password when checked */}
          <div className="pt-1">
            <label
              htmlFor="checkbox-show-all-passwords"
              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none font-medium"
            >
              <input
                id="checkbox-show-all-passwords"
                type="checkbox"
                checked={showAllPasswords}
                onChange={(e) => setShowAllPasswords(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                {showAllPasswords ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                Show passwords
              </span>
            </label>
          </div>

          <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/80 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Security Audit:</strong> Password updates record client IP address, exact millisecond timestamp, and authorization context in the committee audit trail.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
