import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export interface DeleteTarget {
  type: 'income' | 'expense' | 'member';
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  currency?: string;
  reference?: string;
}

interface ConfirmDeleteModalProps {
  target: DeleteTarget | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  target,
  onConfirm,
  onCancel,
}) => {
  if (!target) return null;

  const isIncome = target.type === 'income';
  const isExpense = target.type === 'expense';
  const isMember = target.type === 'member';

  const typeLabel = isIncome
    ? 'Chanda / Donation Receipt'
    : isExpense
    ? 'Expense Payment Voucher'
    : 'Committee Member';

  return (
    <div
      id="confirm-delete-modal-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-rose-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-rose-950">Delete {typeLabel}</h3>
              <p className="text-xs text-rose-700">Permanent ledger action</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete this {typeLabel.toLowerCase()}? This action
            cannot be undone and will immediately update the committee balances and audit trail.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            {target.reference && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Reference / No:</span>
                <span className="font-mono font-bold text-slate-900">{target.reference}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">
                {isMember ? 'Member Name' : isIncome ? 'Donor' : 'Payee'}:
              </span>
              <span className="font-semibold text-slate-900">{target.title}</span>
            </div>
            {target.subtitle && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Category / Role:</span>
                <span className="text-slate-700">{target.subtitle}</span>
              </div>
            )}
            {target.amount !== undefined && (
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Amount:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    isIncome ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatCurrency(target.amount, target.currency || '₹')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            id="btn-cancel-delete"
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Yes, Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};
