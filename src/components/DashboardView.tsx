import React from 'react';
import {
  PujaManagementState,
  IncomeRecord,
  ExpenseRecord,
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Users,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  state: PujaManagementState;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenAddMember: () => void;
  onSelectIncomeReceipt: (record: IncomeRecord) => void;
  onSelectExpenseVoucher: (record: ExpenseRecord) => void;
  onOpenAuditReport: () => void;
  onOpenExcelExport: () => void;
  canEdit?: boolean;
}

const COLORS = [
  '#d97706',
  '#2563eb',
  '#059669',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#ea580c',
  '#4b5563',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenAddMember,
  onSelectIncomeReceipt,
  onSelectExpenseVoucher,
  onOpenAuditReport,
  onOpenExcelExport,
  canEdit = true,
}) => {
  const { settings, incomes, expenses, members } = state;

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const budget = settings.targetBudget || 1;
  const budgetUtilization = Math.round((totalExpense / budget) * 100);
  const collectionRate = Math.round((totalIncome / budget) * 100);

  // Cash vs Digital breakdown
  const cashIncome = incomes
    .filter((i) => i.paymentMode === 'Cash')
    .reduce((s, i) => s + i.amount, 0);
  const cashExpense = expenses
    .filter((e) => e.paymentMode === 'Cash')
    .reduce((s, e) => s + e.amount, 0);
  const cashInHand = cashIncome - cashExpense;

  const digitalIncome = totalIncome - cashIncome;
  const digitalExpense = totalExpense - cashExpense;
  const bankBalance = digitalIncome - digitalExpense;

  // Expense by Category data for Pie Chart
  const expenseCatMap: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });
  const expenseChartData = Object.entries(expenseCatMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Payment Mode Distribution
  const paymentModeMap: Record<string, number> = {
    Cash: 0,
    'UPI / QR Code': 0,
    'Bank Transfer': 0,
    Cheque: 0,
  };
  incomes.forEach((i) => {
    paymentModeMap[i.paymentMode] = (paymentModeMap[i.paymentMode] || 0) + i.amount;
  });
  const paymentModeData = Object.entries(paymentModeMap)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }));

  // Combined Recent Transactions (latest 7)
  const combinedTransactions = [
    ...incomes.map((i) => ({
      type: 'income' as const,
      id: i.id,
      refNumber: i.receiptNumber,
      date: i.date,
      name: i.donorName,
      category: i.category,
      amount: i.amount,
      mode: i.paymentMode,
      raw: i,
    })),
    ...expenses.map((e) => ({
      type: 'expense' as const,
      id: e.id,
      refNumber: e.voucherNumber,
      date: e.date,
      name: e.payeeName,
      category: e.category,
      amount: e.amount,
      mode: e.paymentMode,
      raw: e,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentTransactions = combinedTransactions.slice(0, 8);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Welcome / Status Bar */}
      <div className="bg-linear-to-r from-amber-600 via-amber-700 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Festival Financial Overview &bull; {settings.pujaYear}</span>
          </div>
          <h2 className="text-2xl font-black font-serif tracking-tight">
            {settings.committeeName}
          </h2>
          <p className="text-xs text-amber-100/90 mt-1 max-w-xl">
            {settings.tagline || 'All records tracked locally in browser storage.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center flex-wrap gap-2.5">
          {canEdit ? (
            <>
              <button
                id="btn-quick-add-income"
                onClick={onOpenAddIncome}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                + Record Chanda
              </button>
              <button
                id="btn-quick-add-expense"
                onClick={onOpenAddExpense}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-900 text-white font-bold rounded-xl text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-rose-400" />
                + Record Expense
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 bg-slate-900/70 border border-amber-400/40 text-amber-200 text-xs font-semibold rounded-xl flex items-center gap-1.5">
              <span>🔒 View-Only Mode (Edit restricted to Admin, Secretary & Treasurer)</span>
            </div>
          )}
          <button
            id="btn-quick-audit-report"
            onClick={onOpenAuditReport}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Audit Sheet
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Chanda & Income
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(totalIncome, settings.currency)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{incomes.length} receipts issued</span>
              <span className="text-emerald-700 font-semibold">{collectionRate}% of target</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Expenditures
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(totalExpense, settings.currency)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{expenses.length} vouchers logged</span>
              <span className="text-rose-700 font-semibold">{budgetUtilization}% of budget</span>
            </div>
          </div>
        </div>

        {/* Net Available Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Net Fund Balance
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-black font-mono tracking-tight ${
                netBalance >= 0 ? 'text-amber-950' : 'text-rose-600'
              }`}
            >
              {formatCurrency(netBalance, settings.currency)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span title="Physical Cash in Hand">Cash: {formatCurrency(cashInHand, settings.currency)}</span>
              <span title="Bank balance">Bank: {formatCurrency(bankBalance, settings.currency)}</span>
            </div>
          </div>
        </div>

        {/* Target Budget & Members */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Budget & Committee
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(settings.targetBudget, settings.currency)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>Target Estimate</span>
              <span className="text-blue-700 font-semibold">{members.length} Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Utilization Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-700">
            Festival Budget Execution ({formatCurrency(totalExpense, settings.currency)} spent of{' '}
            {formatCurrency(budget, settings.currency)} target)
          </span>
          <span
            className={`font-mono font-bold ${
              budgetUtilization > 100
                ? 'text-rose-600'
                : budgetUtilization > 85
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {budgetUtilization}% Utilized
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${
              budgetUtilization > 100
                ? 'bg-rose-500'
                : budgetUtilization > 85
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, budgetUtilization)}%` }}
          ></div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Expense Distribution by Category */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expenses by Category</h3>
              <p className="text-xs text-slate-500">Major festival spending breakdown</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{expenses.length} records</span>
          </div>

          <div className="h-64 w-full">
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => (val.length > 15 ? val.substring(0, 13) + '...' : val)}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatCurrency(Number(value), settings.currency),
                      'Total Spent',
                    ]}
                  />
                  <Bar dataKey="value" fill="#d97706" radius={[0, 4, 4, 0]}>
                    {expenseChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense vouchers recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Income by Payment Mode */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment Modes</h3>
              <p className="text-xs text-slate-500">Cash vs UPI vs Bank collections</p>
            </div>
          </div>

          <div className="h-48 w-full">
            {paymentModeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentModeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      formatCurrency(Number(value), settings.currency),
                      'Collected',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No collections yet.
              </div>
            )}
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash: {formatCurrency(cashIncome, settings.currency)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>UPI: {formatCurrency(paymentModeMap['UPI / QR Code'] || 0, settings.currency)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Bank: {formatCurrency(paymentModeMap['Bank Transfer'] || 0, settings.currency)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>Cheque: {formatCurrency(paymentModeMap['Cheque'] || 0, settings.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Ledger Activity</h3>
            <p className="text-xs text-slate-500">Latest chanda receipts and expense vouchers</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExcelExport}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Download All in Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-4 py-3">Ref / Voucher</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Party / Donor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tx.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                    {tx.refNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(tx.date)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{tx.name}</td>
                  <td className="px-4 py-3 text-slate-600">{tx.category}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {tx.mode}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-3 text-right font-mono font-bold ${
                      tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, settings.currency)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tx.type === 'income' ? (
                      <button
                        onClick={() => onSelectIncomeReceipt(tx.raw as IncomeRecord)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                      >
                        Receipt
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectExpenseVoucher(tx.raw as ExpenseRecord)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        Voucher
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    No transactions recorded yet. Click "+ Record Chanda" above to add the first receipt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
