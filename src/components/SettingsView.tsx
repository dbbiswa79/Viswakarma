import React, { useState } from 'react';
import {
  CommitteeSettings,
  UserAccount,
  AuditLogItem,
  canEditData,
} from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  Settings,
  Save,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  History,
  Building,
  UserCheck,
  Phone,
  Mail,
  Sparkles,
  ShieldAlert,
  Globe,
  Clock,
} from 'lucide-react';

interface SettingsViewProps {
  settings: CommitteeSettings;
  users: UserAccount[];
  auditLogs: AuditLogItem[];
  currentUser: UserAccount | null;
  onSaveSettings: (newSettings: CommitteeSettings) => void;
  onOpenChangePassword: (targetUser?: UserAccount) => void;
  canEdit?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  users,
  auditLogs,
  currentUser,
  onSaveSettings,
  onOpenChangePassword,
  canEdit: propCanEdit,
}) => {
  const canEdit = propCanEdit ?? canEditData(currentUser?.role);
  const [formData, setFormData] = useState<CommitteeSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">Committee Settings & Configuration</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure committee identity, venue, office bearers, budget target, bank details, and vouchers
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully in local storage!</span>
          </div>
        )}
      </div>

      {/* Read-Only Warning Banner for restricted roles */}
      {!canEdit && (
        <div className="px-4 py-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs font-medium flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Read-Only Access:</strong> You are currently signed in with the{' '}
            <strong className="capitalize">{currentUser?.role || 'auditor'}</strong> role. Only Admin, Secretary, and Treasurer have authorization to update committee settings and ledgers.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={!canEdit} className="space-y-6 disabled:opacity-85">
        {/* Committee Identity Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-amber-600" />
            <span>General Committee Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Committee Name *
              </label>
              <input
                id="cfg-committee-name"
                type="text"
                value={formData.committeeName}
                onChange={(e) =>
                  setFormData({ ...formData, committeeName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Puja Edition / Year *
              </label>
              <input
                id="cfg-puja-year"
                type="text"
                value={formData.pujaYear}
                onChange={(e) =>
                  setFormData({ ...formData, pujaYear: e.target.value })
                }
                placeholder="e.g. 2025-2026"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Venue / Pandal Ground *
              </label>
              <input
                id="cfg-venue"
                type="text"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Industrial Area
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registration / Trust No.
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({ ...formData, registrationNumber: e.target.value })
                }
                placeholder="e.g. REG/BKPS/2025"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Financial Target Budget *
              </label>
              <input
                id="cfg-target-budget"
                type="number"
                min="1000"
                step="5000"
                value={formData.targetBudget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetBudget: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Committee Slogan / Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Committee Key Officials */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Key Committee Signatories & Officials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                President Name *
              </label>
              <input
                id="cfg-president-name"
                type="text"
                value={formData.presidentName}
                onChange={(e) =>
                  setFormData({ ...formData, presidentName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                General Secretary Name *
              </label>
              <input
                id="cfg-secretary-name"
                type="text"
                value={formData.secretaryName}
                onChange={(e) =>
                  setFormData({ ...formData, secretaryName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Treasurer / Cashier Name *
              </label>
              <input
                id="cfg-treasurer-name"
                type="text"
                value={formData.treasurerName}
                onChange={(e) =>
                  setFormData({ ...formData, treasurerName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chartered Internal Auditor Name
              </label>
              <input
                type="text"
                value={formData.auditorName}
                onChange={(e) =>
                  setFormData({ ...formData, auditorName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Contact Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Voucher Prefixes & Receipts Note */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Voucher Sequence & Blessing Message</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Donation Receipt Prefix
              </label>
              <input
                type="text"
                value={formData.receiptPrefix}
                onChange={(e) =>
                  setFormData({ ...formData, receiptPrefix: e.target.value })
                }
                placeholder="BK-REC"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expense Voucher Prefix
              </label>
              <input
                type="text"
                value={formData.expensePrefix}
                onChange={(e) =>
                  setFormData({ ...formData, expensePrefix: e.target.value })
                }
                placeholder="BK-EXP"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Blessing Message Printed on Receipts
            </label>
            <textarea
              rows={2}
              value={formData.blessingMessage}
              onChange={(e) =>
                setFormData({ ...formData, blessingMessage: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-serif italic"
            />
          </div>
        </div>
        </fieldset>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {canEdit ? (
            <button
              id="btn-save-settings"
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Committee Settings
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-100 text-slate-500 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Read-Only: Modifying settings restricted to Admin, Secretary & Treasurer
            </div>
          )}
        </div>
      </form>

      {/* Security & User Roles Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Online User Accounts & Committee Roles</span>
          </div>
          {currentUser && (
            <button
              onClick={() => onOpenChangePassword(currentUser)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              Change My Password
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-2.5">Username</th>
                <th className="px-4 py-2.5">Full Name</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Access Right</th>
                <th className="px-4 py-2.5">Password Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const canChange = isSelf || currentUser?.role === 'admin';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                      {u.username}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{u.fullName}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.role === 'admin' || u.role === 'secretary' || u.role === 'treasurer' || u.role === 'editor'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {u.role === 'admin' || u.role === 'secretary' || u.role === 'treasurer' || u.role === 'editor'
                          ? 'Editor / Full Operations'
                          : 'Auditor / Read-Only'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {canChange ? (
                        <button
                          onClick={() => onOpenChangePassword(u)}
                          className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title={`Change password for ${u.username}`}
                        >
                          <KeyRound className="w-3 h-3 text-amber-700" />
                          <span>{isSelf ? 'Change Password' : 'Reset Password'}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Self / Admin Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Default Password for All Accounts:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold text-slate-900">admin123</code>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 italic">
            Each role can update or personalize their password anytime.
          </span>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <History className="w-4 h-4 text-slate-600" />
            <span>Committee Audit Trail & Security Event Log</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {auditLogs.length} total recorded actions
          </span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs divide-y divide-slate-100 pr-1">
          {auditLogs
            .slice()
            .reverse()
            .map((log) => {
              const isSecurity =
                log.action.includes('Password') || log.action.includes('Security');
              return (
                <div
                  key={log.id}
                  className={`pt-2.5 pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                    isSecurity ? 'bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/70 mb-2' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-bold ${
                          isSecurity ? 'text-amber-900' : 'text-slate-800'
                        }`}
                      >
                        {log.action}:
                      </span>
                      {log.ipAddress && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white text-slate-800 border border-slate-300 shadow-2xs">
                          <Globe className="w-3 h-3 text-amber-600 shrink-0" />
                          IP: {log.ipAddress}
                        </span>
                      )}
                      {isSecurity && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                          <ShieldAlert className="w-3 h-3 text-amber-700" />
                          Security Event
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600 leading-relaxed">{log.details}</div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                      <span>
                        By user:{' '}
                        <strong className="text-slate-700 font-semibold">{log.user}</strong>
                      </span>
                      {log.clientContext && (
                        <span>&bull; Client: {log.clientContext}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-[11px] font-mono font-semibold text-slate-700 whitespace-nowrap flex items-center sm:justify-end gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{log.exactTimestamp || formatDateTime(log.timestamp)}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400" title="Exact ISO Timestamp">
                      {log.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
