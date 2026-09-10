import React from 'react';
import { PujaManagementState } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Printer, X, Award } from 'lucide-react';

interface AuditReportPrintModalProps {
  state: PujaManagementState;
  onClose: () => void;
}

export const AuditReportPrintModal: React.FC<AuditReportPrintModalProps> = ({
  state,
  onClose,
}) => {
  const { settings, incomes, expenses, members } = state;

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const cashIncome = incomes
    .filter((i) => i.paymentMode === 'Cash')
    .reduce((sum, i) => sum + i.amount, 0);
  const cashExpense = expenses
    .filter((e) => e.paymentMode === 'Cash')
    .reduce((sum, e) => sum + e.amount, 0);
  const cashInHand = cashIncome - cashExpense;

  const bankIncome = totalIncome - cashIncome;
  const bankExpense = totalExpense - cashExpense;
  const bankBalance = bankIncome - bankExpense;

  // Group by category
  const incByCat: Record<string, number> = {};
  incomes.forEach((i) => {
    incByCat[i.category] = (incByCat[i.category] || 0) + i.amount;
  });

  const expByCat: Record<string, number> = {};
  expenses.forEach((e) => {
    expByCat[e.category] = (expByCat[e.category] || 0) + e.amount;
  });

  return (
    <div
      id="audit-report-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold">Official Committee Audit & Balance Sheet</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Full Audit Report
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 bg-white text-slate-900" id="printable-audit-sheet">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest font-serif mb-1">
              || ॐ विश्वकर्मणे नमः ||
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 font-serif">
              {settings.committeeName}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              {settings.venue}, {settings.city}
            </p>
            <div className="text-xs text-slate-500 mt-1">
              <span>Puja Edition: <strong>{settings.pujaYear}</strong></span> &bull;{' '}
              <span>Reg No: <strong>{settings.registrationNumber || 'N/A'}</strong></span>
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mt-3 py-1 px-4 bg-slate-100 inline-block rounded border border-slate-300">
              Annual Income & Expenditure Statement & Audit Balance Sheet
            </h2>
            <div className="text-[11px] text-slate-500 mt-1">
              Report Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* KPI Summary Block */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Approved Budget</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-1">
                {formatCurrency(settings.targetBudget, settings.currency)}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-800">Total Collections</div>
              <div className="text-base font-bold text-emerald-900 font-mono mt-1">
                {formatCurrency(totalIncome, settings.currency)}
              </div>
              <div className="text-[10px] text-emerald-700">{incomes.length} donors</div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-red-800">Total Expenditure</div>
              <div className="text-base font-bold text-red-900 font-mono mt-1">
                {formatCurrency(totalExpense, settings.currency)}
              </div>
              <div className="text-[10px] text-red-700">{expenses.length} vouchers</div>
            </div>
            <div className={`p-3 border rounded-lg text-center ${netBalance >= 0 ? 'bg-amber-50 border-amber-300' : 'bg-rose-50 border-rose-300'}`}>
              <div className="text-[10px] uppercase font-bold text-slate-700">Net Balance Available</div>
              <div className={`text-base font-black font-mono mt-1 ${netBalance >= 0 ? 'text-amber-950' : 'text-rose-700'}`}>
                {formatCurrency(netBalance, settings.currency)}
              </div>
              <div className="text-[10px] text-slate-600">
                {netBalance >= 0 ? 'Surplus Fund' : 'Deficit'}
              </div>
            </div>
          </div>

          {/* Two Columns: Income Heads vs Expense Heads */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Income Heads */}
            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/50">
              <div className="font-bold text-xs uppercase tracking-wider text-emerald-800 pb-2 border-b border-emerald-300 flex justify-between">
                <span>Income Account Heads</span>
                <span>Amount ({settings.currency})</span>
              </div>
              <div className="space-y-1.5 mt-2 text-xs">
                {Object.entries(incByCat).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-700">{cat}</span>
                    <span className="font-semibold font-mono text-slate-900">
                      {formatCurrency(amt, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 mt-2 border-t-2 border-slate-800 text-xs font-bold">
                <span>TOTAL REVENUE (A)</span>
                <span className="font-mono text-emerald-800">{formatCurrency(totalIncome, settings.currency)}</span>
              </div>
            </div>

            {/* Expense Heads */}
            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/50">
              <div className="font-bold text-xs uppercase tracking-wider text-red-800 pb-2 border-b border-red-300 flex justify-between">
                <span>Expenditure Account Heads</span>
                <span>Amount ({settings.currency})</span>
              </div>
              <div className="space-y-1.5 mt-2 text-xs">
                {Object.entries(expByCat).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-700">{cat}</span>
                    <span className="font-semibold font-mono text-slate-900">
                      {formatCurrency(amt, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 mt-2 border-t-2 border-slate-800 text-xs font-bold">
                <span>TOTAL EXPENDITURE (B)</span>
                <span className="font-mono text-red-800">{formatCurrency(totalExpense, settings.currency)}</span>
              </div>
            </div>
          </div>

          {/* Cash & Bank Reconciliation Table */}
          <div className="border border-slate-300 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
              Liquidity & Bank Reconciliation
            </h3>
            <div className="grid grid-cols-3 gap-4 text-xs text-center">
              <div className="p-2 bg-slate-100 rounded">
                <div className="text-slate-500 text-[11px]">Cash in Hand</div>
                <div className="font-bold font-mono text-sm text-slate-800 mt-1">
                  {formatCurrency(cashInHand, settings.currency)}
                </div>
                <div className="text-[10px] text-slate-400">
                  Collected {formatCurrency(cashIncome, settings.currency)} - Disbursed {formatCurrency(cashExpense, settings.currency)}
                </div>
              </div>
              <div className="p-2 bg-slate-100 rounded">
                <div className="text-slate-500 text-[11px]">Bank Account Balance</div>
                <div className="font-bold font-mono text-sm text-slate-800 mt-1">
                  {formatCurrency(bankBalance, settings.currency)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {settings.bankDetails?.bankName || 'Bank Account'}
                </div>
              </div>
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <div className="text-amber-800 font-semibold text-[11px]">Total Net Liquid Balance</div>
                <div className="font-black font-mono text-sm text-amber-950 mt-1">
                  {formatCurrency(netBalance, settings.currency)}
                </div>
                <div className="text-[10px] text-amber-700">Surplus held in trust</div>
              </div>
            </div>
          </div>

          {/* Auditor Certification Statement */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 mb-8 italic">
            "We have verified and audited all cash books, bank statements, donation counterfoils,
            and debit expense vouchers of {settings.committeeName} for the festival session {settings.pujaYear}.
            In our opinion and to the best of our knowledge, the accounts reflect a true and fair view of the financial affairs of the committee."
          </div>

          {/* Four Signatory Approvals */}
          <div className="grid grid-cols-4 gap-4 text-center text-xs pt-4 border-t border-slate-300">
            <div>
              <div className="h-12"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                {settings.presidentName}
              </div>
              <div className="text-[10px] text-slate-500">President</div>
            </div>
            <div>
              <div className="h-12"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                {settings.secretaryName}
              </div>
              <div className="text-[10px] text-slate-500">General Secretary</div>
            </div>
            <div>
              <div className="h-12"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                {settings.treasurerName}
              </div>
              <div className="text-[10px] text-slate-500">Treasurer / Cashier</div>
            </div>
            <div>
              <div className="h-12"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                {settings.auditorName}
              </div>
              <div className="text-[10px] text-slate-500">Chartered Auditor / Examiner</div>
            </div>
          </div>
        </div>

        <div className="print:hidden bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Ready for audit meetings, AGM presentation, or bank submission</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
