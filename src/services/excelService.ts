import * as XLSX from 'xlsx';
import { PujaManagementState } from '../types';
import { formatDate } from '../utils/formatters';

export const excelService = {
  exportCompletePujaWorkbook(state: PujaManagementState): void {
    const { settings, members, incomes, expenses } = state;
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

    const digitalIncome = totalIncome - cashIncome;
    const digitalExpense = totalExpense - cashExpense;
    const bankBalance = digitalIncome - digitalExpense;

    const wb = XLSX.utils.book_new();

    // 1. Executive Summary Sheet
    const summaryData = [
      ['BISHWAKARMA PUJA COMMITTEE — FINANCIAL AUDIT REPORT & SUMMARY'],
      ['Committee Name', settings.committeeName],
      ['Puja Year / Edition', settings.pujaYear],
      ['Registration No.', settings.registrationNumber || 'N/A'],
      ['Venue / Pandal', `${settings.venue}, ${settings.city}`],
      ['Generated On', new Date().toLocaleString('en-IN')],
      ['Currency', settings.currency],
      [],
      ['KEY FINANCIAL METRICS', 'AMOUNT (' + settings.currency + ')', 'NOTES'],
      ['Target Budget', settings.targetBudget, 'Approved Budget Estimate'],
      ['Total Income / Collections', totalIncome, `${incomes.length} receipts issued`],
      ['Total Expenditures', totalExpense, `${expenses.length} vouchers recorded`],
      [
        'Net Surplus / (Deficit)',
        netBalance,
        netBalance >= 0 ? 'Surplus in Fund' : 'Deficit / Overspent',
      ],
      [],
      ['CASH & LIQUIDITY BREAKDOWN', 'AMOUNT (' + settings.currency + ')'],
      ['Cash Collected', cashIncome],
      ['Cash Paid Out', cashExpense],
      ['Estimated Cash in Hand', cashInHand],
      ['Bank / Digital Collections', digitalIncome],
      ['Bank / Digital Expenses', digitalExpense],
      ['Bank Account Balance', bankBalance],
      [],
      ['COMMITTEE SIGNATORIES', 'NAME', 'CONTACT'],
      ['President', settings.presidentName, settings.contactPhone],
      ['General Secretary', settings.secretaryName, ''],
      ['Treasurer / Cashier', settings.treasurerName, ''],
      ['Auditor', settings.auditorName, ''],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // 2. Income Sheet
    const incomeHeaders = [
      'Receipt No',
      'Date',
      'Donor / Contributor Name',
      'Phone',
      'Address',
      'Category',
      'Amount (' + settings.currency + ')',
      'Payment Mode',
      'Txn / Cheque Ref',
      'Collected By',
      'Remarks',
    ];
    const incomeRows = incomes.map((inc) => [
      inc.receiptNumber,
      formatDate(inc.date),
      inc.donorName,
      inc.phone || '',
      inc.address || '',
      inc.category,
      inc.amount,
      inc.paymentMode,
      inc.transactionRef || '',
      inc.collectedBy,
      inc.notes || '',
    ]);
    const wsIncome = XLSX.utils.aoa_to_sheet([incomeHeaders, ...incomeRows]);
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Income_Donations');

    // 3. Expense Sheet
    const expenseHeaders = [
      'Voucher No',
      'Date',
      'Payee / Vendor Name',
      'Category',
      'Amount (' + settings.currency + ')',
      'Payment Mode',
      'Bill / Invoice Ref',
      'Authorized By',
      'Paid By',
      'Remarks / Purpose',
    ];
    const expenseRows = expenses.map((exp) => [
      exp.voucherNumber,
      formatDate(exp.date),
      exp.payeeName,
      exp.category,
      exp.amount,
      exp.paymentMode,
      exp.invoiceNumber || '',
      exp.authorizedBy,
      exp.paidBy,
      exp.notes || '',
    ]);
    const wsExpense = XLSX.utils.aoa_to_sheet([expenseHeaders, ...expenseRows]);
    XLSX.utils.book_append_sheet(wb, wsExpense, 'Expenses_Vouchers');

    // 4. Members Directory Sheet
    const memberHeaders = [
      'Member Code',
      'Full Name',
      'Designation / Role',
      'Phone',
      'Blood Group',
      'Contributed Amount (' + settings.currency + ')',
      'Status',
      'Address',
      'Notes',
    ];
    const memberRows = members.map((m) => [
      m.memberCode,
      m.fullName,
      m.designation,
      m.phone,
      m.bloodGroup || '',
      m.contributedAmount,
      m.status.toUpperCase(),
      m.address || '',
      m.notes || '',
    ]);
    const wsMembers = XLSX.utils.aoa_to_sheet([memberHeaders, ...memberRows]);
    XLSX.utils.book_append_sheet(wb, wsMembers, 'Members');

    // 5. Category Breakdown Sheet
    const expByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount;
    });

    const incByCategory: Record<string, number> = {};
    incomes.forEach((i) => {
      incByCategory[i.category] = (incByCategory[i.category] || 0) + i.amount;
    });

    const categoryData: any[][] = [
      ['INCOME BY CATEGORY', 'TOTAL AMOUNT (' + settings.currency + ')', '% OF TOTAL INCOME'],
    ];
    Object.entries(incByCategory).forEach(([cat, amt]) => {
      const pct = totalIncome > 0 ? ((amt / totalIncome) * 100).toFixed(1) + '%' : '0%';
      categoryData.push([cat, amt, pct]);
    });

    categoryData.push([]);
    categoryData.push([
      'EXPENSES BY CATEGORY',
      'TOTAL AMOUNT (' + settings.currency + ')',
      '% OF TOTAL EXPENSES',
    ]);
    Object.entries(expByCategory).forEach(([cat, amt]) => {
      const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) + '%' : '0%';
      categoryData.push([cat, amt, pct]);
    });

    const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCategories, 'Category_Breakdown');

    // Generate and trigger download
    const filename = `Bishwakarma_Puja_Financials_${settings.pujaYear.replace(
      /[^a-z0-9]/gi,
      '_'
    )}.xlsx`;
    XLSX.writeFile(wb, filename);
  },

  exportFilteredIncomeCsv(incomes: any[], currency: string): void {
    const headers = [
      'Receipt No',
      'Date',
      'Donor Name',
      'Phone',
      'Category',
      `Amount (${currency})`,
      'Mode',
      'Txn Ref',
      'Collected By',
    ];
    const rows = incomes.map((i) => [
      i.receiptNumber,
      formatDate(i.date),
      `"${(i.donorName || '').replace(/"/g, '""')}"`,
      i.phone || '',
      `"${i.category}"`,
      i.amount,
      i.paymentMode,
      `"${i.transactionRef || ''}"`,
      `"${i.collectedBy}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bishwakarma_Income_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  exportFilteredExpensesCsv(expenses: any[], currency: string): void {
    const headers = [
      'Voucher No',
      'Date',
      'Payee Name',
      'Category',
      `Amount (${currency})`,
      'Mode',
      'Invoice No',
      'Authorized By',
    ];
    const rows = expenses.map((e) => [
      e.voucherNumber,
      formatDate(e.date),
      `"${(e.payeeName || '').replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      e.paymentMode,
      `"${e.invoiceNumber || ''}"`,
      `"${e.authorizedBy}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bishwakarma_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
