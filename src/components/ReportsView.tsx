import React, { useState, useMemo } from 'react';
import { PujaManagementState } from '../types';
import { formatCurrency } from '../utils/formatters';
import { excelService } from '../services/excelService';
import {
  FileBarChart,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Building,
} from 'lucide-react';

interface ReportsViewProps {
  state: PujaManagementState;
  onOpenAuditPrintModal: () => void;
  onOpenExcelExport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  state,
  onOpenAuditPrintModal,
  onOpenExcelExport,
}) => {
  const { settings, incomes, expenses, members } = state;
  const [dateFilter, setDateFilter] = useState<'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredIncomes = useMemo(() => {
    if (dateFilter === 'all' || !startDate || !endDate) return incomes;
    return incomes.filter((i) => i.date >= startDate && i.date <= endDate);
  }, [incomes, dateFilter, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    if (dateFilter === 'all' || !startDate || !endDate) return expenses;
    return expenses.filter((e) => e.date >= startDate && e.date <= endDate);
  }, [expenses, dateFilter, startDate, endDate]);

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netSurplus = totalIncome - totalExpense;

  // Cash vs Bank breakdown
  const cashIncome = filteredIncomes
    .filter((i) => i.paymentMode === 'Cash')
    .reduce((sum, i) => sum + i.amount, 0);
  const cashExpense = filteredExpenses
    .filter((e) => e.paymentMode === 'Cash')
    .reduce((sum, e) => sum + e.amount, 0);
  const cashInHand = cashIncome - cashExpense;

  const bankIncome = totalIncome - cashIncome;
  const bankExpense = totalExpense - cashExpense;
  const bankBalance = bankIncome - bankExpense;

  // Categories aggregation
  const incomeCategories: Record<string, number> = {};
  filteredIncomes.forEach((i) => {
    incomeCategories[i.category] = (incomeCategories[i.category] || 0) + i.amount;
  });

  const expenseCategories: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">Financial Audit & Balance Sheet</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified accounts statement for committee general meetings, bank submission, and members review
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-reports-excel"
            onClick={onOpenExcelExport}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel Workbook
          </button>

          <button
            id="btn-reports-print-sheet"
            onClick={onOpenAuditPrintModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Official Audit Statement
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Accounting Period:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Full Festival Season
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                dateFilter === 'custom'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Custom Date Range
            </button>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        )}
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Total Revenue Collected
          </div>
          <div className="text-3xl font-black font-mono text-emerald-950 mt-1">
            {formatCurrency(totalIncome, settings.currency)}
          </div>
          <div className="text-xs text-emerald-700 mt-2">
            From {filteredIncomes.length} receipts issued across all categories
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-800">
            Total Expenditures Disbursed
          </div>
          <div className="text-3xl font-black font-mono text-rose-950 mt-1">
            {formatCurrency(totalExpense, settings.currency)}
          </div>
          <div className="text-xs text-rose-700 mt-2">
            Against {filteredExpenses.length} audited payment vouchers
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            netSurplus >= 0
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-rose-100/70 border-rose-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Net Surplus / (Deficit)
          </div>
          <div
            className={`text-3xl font-black font-mono mt-1 ${
              netSurplus >= 0 ? 'text-amber-950' : 'text-rose-700'
            }`}
          >
            {formatCurrency(netSurplus, settings.currency)}
          </div>
          <div className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
            {netSurplus >= 0 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Balanced with positive reserve fund</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Expenditures exceed collections</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Liquidity Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-500" />
          <span>Cash in Hand & Bank Account Reconciliation</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700 pb-1 border-b border-slate-200">
              <span>Physical Cash Register</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Cash Received:</span>
              <span className="font-mono">{formatCurrency(cashIncome, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Cash Paid Out:</span>
              <span className="font-mono text-rose-600">
                -{formatCurrency(cashExpense, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Estimated Physical Cash in Hand:</span>
              <span className="font-mono text-emerald-700">
                {formatCurrency(cashInHand, settings.currency)}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700 pb-1 border-b border-slate-200">
              <span>Bank & Digital Accounts (UPI/NEFT/Cheque)</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Digital Collections:</span>
              <span className="font-mono">{formatCurrency(bankIncome, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Bank / Digital Disbursals:</span>
              <span className="font-mono text-rose-600">
                -{formatCurrency(bankExpense, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Estimated Bank Account Balance:</span>
              <span className="font-mono text-blue-700">
                {formatCurrency(bankBalance, settings.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Heads Itemized Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Heads */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-emerald-900">Income Account Heads</h3>
            <span className="text-xs font-mono font-bold text-emerald-700">
              {formatCurrency(totalIncome, settings.currency)}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            {Object.entries(incomeCategories).map(([cat, amt]) => {
              const pct = totalIncome > 0 ? Math.round((amt / totalIncome) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>{cat}</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(amt, settings.currency)}{' '}
                      <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(incomeCategories).length === 0 && (
              <p className="text-slate-400 text-center py-6">No income logged in this period.</p>
            )}
          </div>
        </div>

        {/* Expense Heads */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-rose-900">Expenditure Account Heads</h3>
            <span className="text-xs font-mono font-bold text-rose-700">
              {formatCurrency(totalExpense, settings.currency)}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            {Object.entries(expenseCategories).map(([cat, amt]) => {
              const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>{cat}</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(amt, settings.currency)}{' '}
                      <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(expenseCategories).length === 0 && (
              <p className="text-slate-400 text-center py-6">No expenses logged in this period.</p>
            )}
          </div>
        </div>
      </div>

      {/* Signatories Display */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 text-xs">
        <h3 className="font-bold text-slate-900 mb-2">Audit Verification & Office Bearers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-slate-600">
          <div>
            <div className="text-[11px] text-slate-400">President</div>
            <div className="font-semibold text-slate-900">{settings.presidentName}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">General Secretary</div>
            <div className="font-semibold text-slate-900">{settings.secretaryName}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Treasurer</div>
            <div className="font-semibold text-slate-900">{settings.treasurerName}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Chartered Auditor</div>
            <div className="font-semibold text-slate-900">{settings.auditorName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
