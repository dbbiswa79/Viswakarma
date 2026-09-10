import React, { useState, useRef, useMemo } from 'react';
import {
  IncomeRecord,
  CommitteeSettings,
  Member,
  UserAccount,
} from '../types';
import {
  excelImportService,
  ImportPreviewResult,
  ImportMode,
  ParsedIncomeRow,
} from '../services/excelImportService';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  X,
  Search,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
} from 'lucide-react';

interface ImportIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingIncomes: IncomeRecord[];
  members: Member[];
  settings: CommitteeSettings;
  currentUser: UserAccount | null;
  onApplyImport: (
    toAdd: Array<Omit<IncomeRecord, 'id' | 'createdAt'>>,
    toUpdate: Array<IncomeRecord>
  ) => void;
}

export const ImportIncomeModal: React.FC<ImportIncomeModalProps> = ({
  isOpen,
  onClose,
  existingIncomes,
  members,
  settings,
  onApplyImport,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [importMode, setImportMode] = useState<ImportMode>('smart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'add' | 'update' | 'invalid'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse file whenever selectedFile, selectedSheet, or importMode changes
  const runParse = async (file: File, sheet?: string, mode: ImportMode = importMode) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await excelImportService.parseExcelFile(
        file,
        existingIncomes,
        members,
        settings,
        sheet,
        mode
      );
      setPreviewResult(res);
      setSelectedSheet(res.selectedSheet);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to parse the Excel file.');
      setPreviewResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    runParse(file, undefined, importMode);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      runParse(file, undefined, importMode);
    }
  };

  const handleModeChange = (newMode: ImportMode) => {
    setImportMode(newMode);
    if (selectedFile) {
      runParse(selectedFile, selectedSheet, newMode);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (selectedFile) {
      runParse(selectedFile, sheetName, importMode);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewResult(null);
    setSelectedSheet('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter preview rows
  const displayedRows = useMemo(() => {
    if (!previewResult) return [];
    return previewResult.rows.filter((row: ParsedIncomeRow) => {
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesSearch =
        !searchFilter ||
        row.donorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        row.receiptNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (row.phone && row.phone.includes(searchFilter)) ||
        row.category.toLowerCase().includes(searchFilter.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [previewResult, statusFilter, searchFilter]);

  const handleConfirmImport = () => {
    if (!previewResult || previewResult.validRows === 0) return;

    const toAdd: Array<Omit<IncomeRecord, 'id' | 'createdAt'>> = [];
    const toUpdate: Array<IncomeRecord> = [];

    previewResult.rows.forEach((r) => {
      if (r.status === 'add') {
        toAdd.push({
          receiptNumber: r.receiptNumber,
          date: r.date,
          donorName: r.donorName,
          phone: r.phone,
          address: r.address,
          category: r.category,
          amount: r.amount,
          paymentMode: r.paymentMode,
          transactionRef: r.transactionRef,
          collectedBy: r.collectedBy,
          notes: r.notes,
          memberId: r.memberId,
        });
      } else if (r.status === 'update' && r.existingRecord) {
        toUpdate.push({
          ...r.existingRecord,
          receiptNumber: r.receiptNumber,
          date: r.date,
          donorName: r.donorName,
          phone: r.phone ?? r.existingRecord.phone,
          address: r.address ?? r.existingRecord.address,
          category: r.category,
          amount: r.amount,
          paymentMode: r.paymentMode,
          transactionRef: r.transactionRef ?? r.existingRecord.transactionRef,
          collectedBy: r.collectedBy,
          notes: r.notes ?? r.existingRecord.notes,
          memberId: r.memberId ?? r.existingRecord.memberId,
        });
      }
    });

    onApplyImport(toAdd, toUpdate);
    onClose();
    handleReset();
  };

  if (!isOpen) return null;

  return (
    <div
      id="import-income-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-amber-50/50 via-white to-orange-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Import & Sync Income / Chanda from Excel
              </h2>
              <p className="text-xs text-slate-500">
                Bulk add new receipts or update existing records directly from your spreadsheet (.xlsx, .xls, .csv)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-import-template"
              type="button"
              onClick={() => excelImportService.downloadIncomeImportTemplate(settings, members)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download pre-formatted Excel file template with instructions"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              Download Excel Template
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* File Upload Box (If no file selected or want to re-upload) */}
          {!previewResult ? (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/80 scale-[0.99]'
                    : 'border-slate-300 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="p-4 rounded-full bg-amber-100 text-amber-700 shadow-inner">
                  {isProcessing ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isProcessing ? 'Processing spreadsheet...' : 'Choose an Excel file or drag & drop here'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) spreadsheets
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                    Browse File
                  </span>
                </div>
              </div>

              {/* Instructions Pill */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  How Automatic Add & Update Matching Works:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      To Add New Income / Chanda:
                    </span>
                    <p className="text-slate-500 leading-relaxed">
                      Leave the <strong>Receipt No</strong> column blank, or enter a new unique receipt number. The system will auto-assign consecutive receipt numbers (e.g. {settings.receiptPrefix}-2026-001).
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-blue-700 flex items-center gap-1.5 mb-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      To Update Existing Records:
                    </span>
                    <p className="text-slate-500 leading-relaxed">
                      Enter the existing <strong>Receipt No</strong> in the sheet. The importer will match and update the donation amount, date, donor name, payment mode, or remarks automatically.
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          ) : (
            /* File Uploaded & Preview View */
            <div className="space-y-4">
              {/* File Info Bar & Mode Selector */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{previewResult.fileName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-normal">{previewResult.totalRows} rows detected</span>
                    </div>

                    {/* Sheet selector if workbook has > 1 sheet */}
                    {previewResult.sheetNames.length > 1 && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                        <span>Sheet:</span>
                        <select
                          value={selectedSheet}
                          onChange={(e) => handleSheetChange(e.target.value)}
                          className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        >
                          {previewResult.sheetNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Import Mode Selector */}
                  <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-2xs text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleModeChange('smart')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        importMode === 'smart'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Smart (Add & Update)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('addAll')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        importMode === 'addAll'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Add All as New
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('updateOnly')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        importMode === 'updateOnly'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Update Only
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Status Metric Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Detected */}
                <div
                  onClick={() => setStatusFilter('all')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                    Total Rows
                  </div>
                  <div className="text-xl font-mono font-black mt-0.5">
                    {previewResult.totalRows}
                  </div>
                </div>

                {/* To Add */}
                <div
                  onClick={() => setStatusFilter('add')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'add'
                      ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                      : 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      statusFilter === 'add' ? 'text-emerald-100' : 'text-emerald-800'
                    }`}
                  >
                    ➕ To Add (New)
                  </div>
                  <div
                    className={`text-xl font-mono font-black mt-0.5 ${
                      statusFilter === 'add' ? 'text-white' : 'text-emerald-950'
                    }`}
                  >
                    {previewResult.addCount}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 font-medium ${
                      statusFilter === 'add' ? 'text-emerald-200' : 'text-emerald-700'
                    }`}
                  >
                    {formatCurrency(previewResult.totalAmountToAdd, settings.currency)}
                  </div>
                </div>

                {/* To Update */}
                <div
                  onClick={() => setStatusFilter('update')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'update'
                      ? 'border-blue-600 bg-blue-700 text-white shadow-xs'
                      : 'border-blue-200 bg-blue-50/60 hover:bg-blue-50'
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      statusFilter === 'update' ? 'text-blue-100' : 'text-blue-800'
                    }`}
                  >
                    🔄 To Update (Matched)
                  </div>
                  <div
                    className={`text-xl font-mono font-black mt-0.5 ${
                      statusFilter === 'update' ? 'text-white' : 'text-blue-950'
                    }`}
                  >
                    {previewResult.updateCount}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 font-medium ${
                      statusFilter === 'update' ? 'text-blue-200' : 'text-blue-700'
                    }`}
                  >
                    {formatCurrency(previewResult.totalAmountToUpdate, settings.currency)}
                  </div>
                </div>

                {/* Invalid */}
                <div
                  onClick={() => setStatusFilter('invalid')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'invalid'
                      ? 'border-rose-600 bg-rose-700 text-white shadow-xs'
                      : previewResult.invalidCount > 0
                      ? 'border-rose-200 bg-rose-50/60 hover:bg-rose-50'
                      : 'border-slate-200 bg-white opacity-60'
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      statusFilter === 'invalid' ? 'text-rose-100' : 'text-rose-800'
                    }`}
                  >
                    ⚠️ Issues (Skipped)
                  </div>
                  <div
                    className={`text-xl font-mono font-black mt-0.5 ${
                      statusFilter === 'invalid' ? 'text-white' : 'text-rose-950'
                    }`}
                  >
                    {previewResult.invalidCount}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 font-medium ${
                      statusFilter === 'invalid' ? 'text-rose-200' : 'text-rose-700'
                    }`}
                  >
                    Will be ignored
                  </div>
                </div>
              </div>

              {/* Filter / Search within rows */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search preview rows by donor name, phone, or receipt..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Showing {displayedRows.length} of {previewResult.totalRows} rows
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-14 text-center">Row</th>
                        <th className="py-2.5 px-3 w-28">Action</th>
                        <th className="py-2.5 px-3">Receipt No</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Donor / Contributor</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Member Link</th>
                        <th className="py-2.5 px-3">Details / Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                            No rows match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row) => {
                          const isInvalid = row.status === 'invalid';
                          const isUpdate = row.status === 'update';
                          const isAdd = row.status === 'add';

                          return (
                            <tr
                              key={row.rowNumber}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                isInvalid
                                  ? 'bg-rose-50/40'
                                  : isUpdate
                                  ? 'bg-blue-50/20'
                                  : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                                #{row.rowNumber}
                              </td>

                              <td className="py-2.5 px-3">
                                {isAdd && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    + ADD NEW
                                  </span>
                                )}
                                {isUpdate && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    UPDATE
                                  </span>
                                )}
                                {isInvalid && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    INVALID
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                                {row.receiptNumber || '—'}
                                {row.isReceiptGenerated && (
                                  <span className="ml-1 text-[10px] text-emerald-600 font-sans font-medium">
                                    (Auto)
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-slate-600 font-mono whitespace-nowrap">
                                {formatDate(row.date)}
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">
                                  {row.donorName || (
                                    <span className="text-rose-500 italic">Missing Name</span>
                                  )}
                                </div>
                                {row.phone && (
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    {row.phone}
                                  </div>
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                                  {row.category}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                {isInvalid && row.amount <= 0 ? (
                                  <span className="text-rose-500">Invalid</span>
                                ) : (
                                  formatCurrency(row.amount, settings.currency)
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                                {row.paymentMode}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {row.matchedMemberName ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <UserCheck className="w-3 h-3 text-amber-600" />
                                    {row.matchedMemberName}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">—</span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-[11px]">
                                {isInvalid ? (
                                  <div className="text-rose-600 font-medium">
                                    {row.validationErrors.join(', ')}
                                  </div>
                                ) : isUpdate && row.existingRecord ? (
                                  <div className="text-blue-700">
                                    <span>
                                      Existing: {row.existingRecord.donorName} (
                                      {formatCurrency(row.existingRecord.amount, settings.currency)})
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 truncate max-w-[140px] block">
                                    {row.notes || row.address || '—'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {previewResult && (
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Will add <strong className="text-emerald-700">{previewResult.addCount}</strong> new and update{' '}
                <strong className="text-blue-700">{previewResult.updateCount}</strong> existing records.
              </div>

              <button
                id="btn-apply-income-import"
                type="button"
                disabled={previewResult.validRows === 0}
                onClick={handleConfirmImport}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Import {previewResult.validRows} Records
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
