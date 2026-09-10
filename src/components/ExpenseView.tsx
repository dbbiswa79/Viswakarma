import React, { useState, useMemo } from 'react';
import {
  ExpenseRecord,
  ExpenseCategory,
  PaymentMode,
  CommitteeSettings,
  UserAccount,
  canEditData,
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { excelService } from '../services/excelService';
import {
  Plus,
  Search,
  Printer,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Receipt,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { ConfirmDeleteModal, DeleteTarget } from './ConfirmDeleteModal';

interface ExpenseViewProps {
  expenses: ExpenseRecord[];
  settings: CommitteeSettings;
  currentUser: UserAccount | null;
  onAddExpense: (record: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  onUpdateExpense: (record: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
  onPrintVoucher: (record: ExpenseRecord) => void;
  initialOpenModal?: boolean;
  onCloseInitialModal?: () => void;
  canEdit?: boolean;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Idol / Murti & Transport',
  'Priest & Purohit Dakshina',
  'Tent, Pandal & Mandap Decor',
  'Sound System & DJ / Lighting',
  'Flowers & Puja Samagri',
  'Bhog, Prasad & Sweets',
  'Cultural Events & Artists',
  'Security, Police & Permissions',
  'Banner, Memento & Printing',
  'Immersion / Bisarjan Procession & Drum/Dhaak',
  'Volunteer Refreshments & Meals',
  'Electricity & Generator Fuel',
  'Sanitation & Cleaning',
  'Miscellaneous',
];

const PAYMENT_MODES: PaymentMode[] = [
  'Cash',
  'UPI / QR Code',
  'Bank Transfer',
  'Cheque',
];

export const ExpenseView: React.FC<ExpenseViewProps> = ({
  expenses,
  settings,
  currentUser,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onPrintVoucher,
  initialOpenModal = false,
  onCloseInitialModal,
  canEdit: propCanEdit,
}) => {
  const canEdit = propCanEdit ?? canEditData(currentUser?.role);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Form State
  const [payeeName, setPayeeName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Idol / Murti & Transport');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState(settings.presidentName || 'President');
  const [paidBy, setPaidBy] = useState(settings.treasurerName || 'Treasurer');
  const [notes, setNotes] = useState('');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);

  // Next voucher number helper
  const nextVoucherNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const count = expenses.length + 1;
    return `${settings.expensePrefix || 'BK-EXP'}-${year}-${String(count).padStart(3, '0')}`;
  }, [expenses.length, settings.expensePrefix]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        item.payeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesMode = selectedMode === 'all' || item.paymentMode === selectedMode;

      return matchesSearch && matchesCategory && matchesMode;
    });
  }, [expenses, searchQuery, selectedCategory, selectedMode]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAddModal = () => {
    if (!canEdit) return;
    setEditingRecord(null);
    setPayeeName('');
    setCategory('Idol / Murti & Transport');
    setAmount('');
    setPaymentMode('Cash');
    setInvoiceNumber('');
    setAuthorizedBy(settings.presidentName || 'President');
    setPaidBy(settings.treasurerName || 'Treasurer');
    setNotes('');
    setVoucherDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: ExpenseRecord) => {
    if (!canEdit) return;
    setEditingRecord(rec);
    setPayeeName(rec.payeeName);
    setCategory(rec.category);
    setAmount(rec.amount);
    setPaymentMode(rec.paymentMode);
    setInvoiceNumber(rec.invoiceNumber || '');
    setAuthorizedBy(rec.authorizedBy);
    setPaidBy(rec.paidBy);
    setNotes(rec.notes || '');
    setVoucherDate(rec.date);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!amount || amount <= 0) return;

    if (editingRecord) {
      onUpdateExpense({
        ...editingRecord,
        payeeName,
        category,
        amount: Number(amount),
        paymentMode,
        invoiceNumber: invoiceNumber || undefined,
        authorizedBy,
        paidBy,
        notes: notes || undefined,
        date: voucherDate,
      });
    } else {
      onAddExpense({
        voucherNumber: nextVoucherNumber,
        date: voucherDate,
        payeeName,
        category,
        amount: Number(amount),
        paymentMode,
        invoiceNumber: invoiceNumber || undefined,
        authorizedBy,
        paidBy,
        notes: notes || undefined,
      });
    }

    setIsModalOpen(false);
    if (onCloseInitialModal) onCloseInitialModal();
  };

  const handleDeletePrompt = (exp: ExpenseRecord) => {
    setDeleteTarget({
      type: 'expense',
      id: exp.id,
      title: exp.payeeName,
      subtitle: exp.category,
      amount: exp.amount,
      currency: settings.currency,
      reference: exp.voucherNumber,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteExpense(deleteTarget.id);
      setDeleteNotice(`Payment voucher ${deleteTarget.reference} was permanently deleted.`);
      setTimeout(() => setDeleteNotice(null), 3500);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">Expenditure & Voucher Ledger</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record all idol making, pandal decor, sound/light, priest fees, and immersion expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              excelService.exportFilteredExpensesCsv(filteredExpenses, settings.currency)
            }
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Filtered CSV
          </button>

          {canEdit ? (
            <button
              id="btn-add-expense"
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Record Expense Voucher
            </button>
          ) : (
            <span className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200">
              🔒 View-Only Mode
            </span>
          )}
        </div>
      </div>

      {/* Deletion / Action Toast */}
      {deleteNotice && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>{deleteNotice}</span>
          </div>
          <button
            onClick={() => setDeleteNotice(null)}
            className="text-rose-500 hover:text-rose-800 p-0.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-expense-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payee, invoice number, voucher no, or purpose..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-xs"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Expense Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Payment Modes</option>
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Pill */}
      <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3 px-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-500 font-medium">Filtered Expenditure:</span>{' '}
            <strong className="text-rose-950 font-mono text-sm">
              {formatCurrency(totalFilteredAmount, settings.currency)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Records:</span>{' '}
            <strong className="text-slate-900">{filteredExpenses.length} payment vouchers</strong>
          </div>
        </div>
        <span className="text-[11px] text-rose-800">
          Total Spent: {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0), settings.currency)}
        </span>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Voucher No</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Payee / Vendor</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Mode</th>
                <th className="px-4 py-3.5">Authorized By</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                    {exp.voucherNumber}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{exp.payeeName}</div>
                    {exp.invoiceNumber && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Bill: {exp.invoiceNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {exp.paymentMode}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{exp.authorizedBy}</td>
                  <td className="px-6 py-3.5 text-right font-mono font-black text-sm text-rose-700">
                    {formatCurrency(exp.amount, settings.currency)}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPrintVoucher(exp)}
                        title="Print Payment Voucher"
                        className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(exp)}
                            title="Edit Record"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(exp)}
                            title="Delete Record"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No expense records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingRecord ? 'Edit Expense Record' : 'Record Expenditure Voucher'}
                </h3>
                <p className="text-xs text-rose-100">
                  {editingRecord
                    ? `Editing Voucher ${editingRecord.voucherNumber}`
                    : `Next Voucher No: ${nextVoucherNumber}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseInitialModal) onCloseInitialModal();
                }}
                className="text-rose-100 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payee / Vendor Name *
                  </label>
                  <input
                    id="input-payee-name"
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="e.g. Maa Durga Decorators"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Voucher Date *
                  </label>
                  <input
                    type="date"
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount ({settings.currency}) *
                  </label>
                  <input
                    id="input-expense-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expense Head / Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bill / Cash Memo Reference No.
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-9042 or Cash Memo #12"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Authorized By *
                  </label>
                  <input
                    type="text"
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Paid By (Treasurer) *
                  </label>
                  <input
                    type="text"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Purpose / Particulars of Expenditure
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Advance payment for 3 days sound setup & generator diesel"
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-expense-submit"
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingRecord ? 'Save Changes' : 'Generate Payment Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          target={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
