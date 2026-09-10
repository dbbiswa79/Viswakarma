import React, { useState, useMemo } from 'react';
import {
  IncomeRecord,
  IncomeCategory,
  PaymentMode,
  CommitteeSettings,
  Member,
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
  Coins,
  CheckCircle2,
  X,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { ConfirmDeleteModal, DeleteTarget } from './ConfirmDeleteModal';
import { ImportIncomeModal } from './ImportIncomeModal';

interface IncomeViewProps {
  incomes: IncomeRecord[];
  members: Member[];
  settings: CommitteeSettings;
  currentUser: UserAccount | null;
  onAddIncome: (record: Omit<IncomeRecord, 'id' | 'createdAt'>) => void;
  onUpdateIncome: (record: IncomeRecord) => void;
  onDeleteIncome: (id: string) => void;
  onPrintReceipt: (record: IncomeRecord) => void;
  onBatchImportIncome?: (
    toAdd: Array<Omit<IncomeRecord, 'id' | 'createdAt'>>,
    toUpdate: Array<IncomeRecord>
  ) => void;
  initialOpenModal?: boolean;
  onCloseInitialModal?: () => void;
  canEdit?: boolean;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Chanda / General Donation',
  'Member Subscription',
  'Idol / Murti Sponsor',
  'Aarti & Puja Offering',
  'Pandal & Decoration Sponsor',
  'Sound & Light Sponsor',
  'Bhog & Prasad Sponsor',
  'Stall / Booth Rental',
  'Cultural Night Donor',
  'VIP / Corporate Sponsor',
  'Miscellaneous',
];

const PAYMENT_MODES: PaymentMode[] = [
  'Cash',
  'UPI / QR Code',
  'Bank Transfer',
  'Cheque',
];

export const IncomeView: React.FC<IncomeViewProps> = ({
  incomes,
  members,
  settings,
  currentUser,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  onPrintReceipt,
  onBatchImportIncome,
  initialOpenModal = false,
  onCloseInitialModal,
  canEdit: propCanEdit,
}) => {
  const canEdit = propCanEdit ?? canEditData(currentUser?.role);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [importSuccessNotice, setImportSuccessNotice] = useState<{
    added: number;
    updated: number;
  } | null>(null);

  // Form State
  const [donorName, setDonorName] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('Chanda / General Donation');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [collectedBy, setCollectedBy] = useState(settings.treasurerName || 'Treasurer');
  const [notes, setNotes] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);

  // Next receipt number helper
  const nextReceiptNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const count = incomes.length + 1;
    return `${settings.receiptPrefix || 'BK-REC'}-${year}-${String(count).padStart(3, '0')}`;
  }, [incomes.length, settings.receiptPrefix]);

  // Filtered Incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      const matchesSearch =
        item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.phone && item.phone.includes(searchQuery)) ||
        (item.transactionRef && item.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesMode = selectedMode === 'all' || item.paymentMode === selectedMode;

      return matchesSearch && matchesCategory && matchesMode;
    });
  }, [incomes, searchQuery, selectedCategory, selectedMode]);

  // Filter summary stats
  const totalFilteredAmount = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const avgDonation =
    filteredIncomes.length > 0
      ? Math.round(totalFilteredAmount / filteredIncomes.length)
      : 0;

  const handleOpenAddModal = () => {
    if (!canEdit) return;
    setEditingRecord(null);
    setDonorName('');
    setSelectedMemberId('');
    setPhone('');
    setAddress('');
    setCategory('Chanda / General Donation');
    setAmount('');
    setPaymentMode('Cash');
    setTransactionRef('');
    setCollectedBy(settings.treasurerName || 'Treasurer');
    setNotes('');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: IncomeRecord) => {
    if (!canEdit) return;
    setEditingRecord(rec);
    setDonorName(rec.donorName);
    setSelectedMemberId(rec.memberId || '');
    setPhone(rec.phone || '');
    setAddress(rec.address || '');
    setCategory(rec.category);
    setAmount(rec.amount);
    setPaymentMode(rec.paymentMode);
    setTransactionRef(rec.transactionRef || '');
    setCollectedBy(rec.collectedBy);
    setNotes(rec.notes || '');
    setReceiptDate(rec.date);
    setIsModalOpen(true);
  };

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memId = e.target.value;
    setSelectedMemberId(memId);
    if (memId) {
      const member = members.find((m) => m.id === memId);
      if (member) {
        setDonorName(member.fullName);
        setPhone(member.phone);
        setAddress(member.address || '');
        setCategory('Member Subscription');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!amount || amount <= 0) return;

    if (editingRecord) {
      onUpdateIncome({
        ...editingRecord,
        donorName,
        memberId: selectedMemberId || undefined,
        phone: phone || undefined,
        address: address || undefined,
        category,
        amount: Number(amount),
        paymentMode,
        transactionRef: transactionRef || undefined,
        collectedBy,
        notes: notes || undefined,
        date: receiptDate,
      });
    } else {
      onAddIncome({
        receiptNumber: nextReceiptNumber,
        date: receiptDate,
        donorName,
        memberId: selectedMemberId || undefined,
        phone: phone || undefined,
        address: address || undefined,
        category,
        amount: Number(amount),
        paymentMode,
        transactionRef: transactionRef || undefined,
        collectedBy,
        notes: notes || undefined,
      });
    }

    setIsModalOpen(false);
    if (onCloseInitialModal) onCloseInitialModal();
  };

  const handleDeletePrompt = (inc: IncomeRecord) => {
    setDeleteTarget({
      type: 'income',
      id: inc.id,
      title: inc.donorName,
      subtitle: inc.category,
      amount: inc.amount,
      currency: settings.currency,
      reference: inc.receiptNumber,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteIncome(deleteTarget.id);
      setDeleteNotice(`Receipt ${deleteTarget.reference} was permanently deleted.`);
      setTimeout(() => setDeleteNotice(null), 3500);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">Income & Chanda Ledger</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log all festival collections, member subscriptions, corporate sponsorships, and offerings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              id="btn-import-income-excel"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Import Excel or CSV file to add new records or update existing ones"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              Import Excel
            </button>
          )}

          <button
            onClick={() => excelService.exportFilteredIncomeCsv(filteredIncomes, settings.currency)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Filtered CSV
          </button>

          {canEdit ? (
            <button
              id="btn-add-income"
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Record New Chanda
            </button>
          ) : (
            <span className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200">
              🔒 View-Only Mode
            </span>
          )}
        </div>
      </div>

      {/* Import Success Toast */}
      {importSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Excel Import Completed: Successfully added{' '}
              <strong className="text-emerald-950 font-bold">{importSuccessNotice.added} new records</strong> and updated{' '}
              <strong className="text-blue-900 font-bold">{importSuccessNotice.updated} existing records</strong> in the ledger!
            </span>
          </div>
          <button
            onClick={() => setImportSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* Filter and Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-income-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search donor name, phone, or receipt number..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Income Categories</option>
            {INCOME_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Filter */}
        <div>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
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

      {/* Filtered Metrics Summary Pill */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 px-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-500 font-medium">Filtered Total:</span>{' '}
            <strong className="text-amber-950 font-mono text-sm">
              {formatCurrency(totalFilteredAmount, settings.currency)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Records:</span>{' '}
            <strong className="text-slate-900">{filteredIncomes.length} receipts</strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Average Donation:</span>{' '}
            <strong className="text-slate-900 font-mono">
              {formatCurrency(avgDonation, settings.currency)}
            </strong>
          </div>
        </div>
        <span className="text-[11px] text-amber-800">
          Showing {filteredIncomes.length} of {incomes.length} total recorded receipts
        </span>
      </div>

      {/* Main Income Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Receipt No</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Donor / Contributor</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Mode</th>
                <th className="px-4 py-3.5">Collected By</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                    {inc.receiptNumber}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{formatDate(inc.date)}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{inc.donorName}</div>
                    {inc.phone && (
                      <div className="text-[11px] text-slate-400 font-mono">{inc.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {inc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      {inc.paymentMode}
                    </span>
                    {inc.transactionRef && (
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-24">
                        {inc.transactionRef}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{inc.collectedBy}</td>
                  <td className="px-6 py-3.5 text-right font-mono font-black text-sm text-emerald-700">
                    {formatCurrency(inc.amount, settings.currency)}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPrintReceipt(inc)}
                        title="Print Official Receipt Voucher"
                        className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(inc)}
                            title="Edit Record"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(inc)}
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
              {filteredIncomes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No income records found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingRecord ? 'Edit Income Record' : 'Record Chanda / Donation'}
                </h3>
                <p className="text-xs text-amber-100">
                  {editingRecord
                    ? `Editing Receipt ${editingRecord.receiptNumber}`
                    : `Next Receipt No: ${nextReceiptNumber}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseInitialModal) onCloseInitialModal();
                }}
                className="text-amber-100 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Optional: Link to Registered Member */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Registered Member (Optional - Auto-fills)
                </label>
                <select
                  value={selectedMemberId}
                  onChange={handleMemberSelect}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- General / Non-member Donor --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.designation}) &bull; Contributed: {formatCurrency(m.contributedAmount, settings.currency)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Donor Name & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Donor / Contributor Name *
                  </label>
                  <input
                    id="input-donor-name"
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Sri Ramesh Das or M/S ABC Tools"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receipt Date *
                  </label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount ({settings.currency}) *
                  </label>
                  <input
                    id="input-income-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IncomeCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {INCOME_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Mode & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                    Transaction Ref / Cheque No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI-104928 or CHQ-0029"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9830112233"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collected By *
                  </label>
                  <input
                    type="text"
                    value={collectedBy}
                    onChange={(e) => setCollectedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Address / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Offering for morning Aarti and Mahaprasad"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-income-submit"
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingRecord ? 'Save Changes' : 'Generate Receipt'}
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

      {/* Excel Import Modal */}
      {isImportModalOpen && (
        <ImportIncomeModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          existingIncomes={incomes}
          members={members}
          settings={settings}
          currentUser={currentUser}
          onApplyImport={(toAdd, toUpdate) => {
            if (onBatchImportIncome) {
              onBatchImportIncome(toAdd, toUpdate);
            }
            setImportSuccessNotice({
              added: toAdd.length,
              updated: toUpdate.length,
            });
            setTimeout(() => {
              setImportSuccessNotice(null);
            }, 6000);
          }}
        />
      )}
    </div>
  );
};
