import React, { useRef } from 'react';
import { ExpenseRecord, CommitteeSettings } from '../types';
import { formatCurrency, formatDate, amountToWords } from '../utils/formatters';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface ExpenseVoucherPrintModalProps {
  expense: ExpenseRecord | null;
  settings: CommitteeSettings;
  onClose: () => void;
}

export const ExpenseVoucherPrintModal: React.FC<ExpenseVoucherPrintModalProps> = ({
  expense,
  settings,
  onClose,
}) => {
  const voucherRef = useRef<HTMLDivElement>(null);

  if (!expense) return null;

  const handlePrint = () => {
    const cardEl = voucherRef.current || document.getElementById('printable-voucher-card');
    if (!cardEl) {
      window.print();
      return;
    }

    try {
      const printIframe = document.createElement('iframe');
      printIframe.setAttribute(
        'style',
        'position:fixed;right:0;bottom:0;width:0;height:0;border:0;z-index:-1;'
      );
      document.body.appendChild(printIframe);

      const iframeDoc = printIframe.contentWindow?.document;
      if (!iframeDoc) {
        window.print();
        return;
      }

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Voucher_${expense.voucherNumber}_${expense.payeeName.replace(/[^a-zA-Z0-9]/g, '_')}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            body {
              background: #ffffff;
              color: #0f172a;
              padding: 10px;
              display: flex;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            #printable-voucher-card {
              width: 100%;
              max-width: 760px;
              margin: 0 auto;
              background: #ffffff;
            }
            .voucher-frame {
              border: 2px solid #334155;
              border-radius: 12px;
              padding: 24px;
              background: #ffffff;
            }
            .header-text {
              text-align: center;
              border-bottom: 2px solid #cbd5e1;
              padding-bottom: 14px;
              margin-bottom: 16px;
            }
            .comm-name {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
            }
            .meta-grid {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              padding-bottom: 10px;
              margin-bottom: 12px;
              border-bottom: 1px dashed #cbd5e1;
            }
            .row-item {
              display: flex;
              align-items: baseline;
              gap: 8px;
              margin-bottom: 12px;
              font-size: 13px;
            }
            .label-text {
              color: #64748b;
              min-width: 170px;
              font-size: 12px;
              font-weight: 600;
            }
            .dotted-fill {
              flex: 1;
              border-bottom: 1px dotted #94a3b8;
              font-weight: 700;
              color: #0f172a;
              padding-bottom: 2px;
            }
            .amount-box {
              margin-top: 18px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 16px;
              background: #ffe4e6;
              border: 1px solid #fca5a5;
              border-radius: 8px;
            }
            .amount-num {
              font-size: 24px;
              font-weight: 900;
              color: #9f1239;
              font-family: monospace;
            }
            .signature-row {
              margin-top: 36px;
              padding-top: 12px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #cbd5e1;
              text-align: center;
            }
            .sig-box {
              width: 180px;
            }
            .sig-line {
              border-top: 1px solid #64748b;
              padding-top: 4px;
              font-weight: 600;
              font-size: 11px;
              color: #1e293b;
            }
            .sig-sub {
              font-size: 10px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div id="printable-voucher-card">
            <div class="voucher-frame">
              <div class="header-text">
                <div style="font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Committee Expenditure & Debit Voucher</div>
                <h2 class="comm-name">${settings.committeeName}</h2>
                <p style="font-size:12px; color:#475569; margin-top:2px;">${settings.venue} &bull; ${settings.city}</p>
                <div style="display:inline-block; margin-top:8px; padding:3px 12px; background:#e2e8f0; color:#1e293b; font-size:11px; font-weight:700; border-radius:9999px;">
                  Puja Edition ${settings.pujaYear} &bull; Debit Voucher
                </div>
              </div>

              <div class="meta-grid">
                <div>
                  <span style="color:#64748b;">Voucher No:</span>
                  <strong style="font-family:monospace; font-size:14px; margin-left:4px;">${expense.voucherNumber}</strong>
                </div>
                <div>
                  <span style="color:#64748b;">Disbursal Date:</span>
                  <strong style="margin-left:4px;">${formatDate(expense.date)}</strong>
                </div>
              </div>

              <div class="row-item">
                <span class="label-text">Paid To (Payee / Vendor):</span>
                <span class="dotted-fill" style="font-size:15px;">${expense.payeeName}</span>
              </div>

              <div class="row-item">
                <span class="label-text">Expenditure Head / Account:</span>
                <span class="dotted-fill">${expense.category}</span>
              </div>

              ${expense.invoiceNumber ? `
              <div class="row-item">
                <span class="label-text">Invoice / Cash Memo Ref:</span>
                <span class="dotted-fill" style="font-family:monospace;">${expense.invoiceNumber}</span>
              </div>` : ''}

              <div class="row-item">
                <span class="label-text">Amount in Words:</span>
                <span class="dotted-fill" style="font-style:italic; color:#881337; font-weight:600;">${amountToWords(expense.amount)}</span>
              </div>

              <div class="row-item">
                <span class="label-text">Disbursal Mode:</span>
                <span class="dotted-fill">${expense.paymentMode}</span>
              </div>

              ${expense.notes ? `
              <div class="row-item">
                <span class="label-text">Purpose / Particulars:</span>
                <span class="dotted-fill" style="font-weight:normal;">${expense.notes}</span>
              </div>` : ''}

              <div class="amount-box">
                <span style="font-size:12px; font-weight:700; color:#9f1239; text-transform:uppercase;">Total Amount Paid:</span>
                <span class="amount-num">${formatCurrency(expense.amount, settings.currency)}</span>
              </div>

              <div class="signature-row">
                <div class="sig-box">
                  <div style="height:32px;"></div>
                  <div class="sig-line">${expense.payeeName}</div>
                  <div class="sig-sub">Receiver Signature / Stamp</div>
                </div>
                <div class="sig-box">
                  <div style="height:32px;"></div>
                  <div class="sig-line">${expense.paidBy}</div>
                  <div class="sig-sub">Treasurer / Disbursed By</div>
                </div>
                <div class="sig-box">
                  <div style="height:32px;"></div>
                  <div class="sig-line">${expense.authorizedBy}</div>
                  <div class="sig-sub">President / Secretary Approval</div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
        setTimeout(() => {
          try {
            document.body.removeChild(printIframe);
          } catch (e) {
            // ignore
          }
        }, 1500);
      }, 300);
    } catch (e) {
      window.print();
    }
  };

  return (
    <div
      id="voucher-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">
              Official Committee Debit Payment Voucher
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-print-voucher-action"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Voucher (Shows Only Voucher)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payment Voucher Body */}
        <div
          ref={voucherRef}
          className="p-8 bg-slate-50 text-slate-900"
          id="printable-voucher-card"
        >
          <div className="border-2 border-slate-400 rounded-xl p-6 bg-white shadow-sm">
            {/* Header */}
            <div className="text-center border-b pb-3 mb-4 border-slate-300">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Puja Expenditure Debit Voucher
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase">
                {settings.committeeName}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {settings.venue} &bull; {settings.city}
              </p>
              <div className="inline-block mt-2 px-3 py-0.5 bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider rounded">
                Official Payment Voucher
              </div>
            </div>

            {/* Voucher Meta */}
            <div className="grid grid-cols-2 text-xs mb-4 pb-2 border-b border-dashed border-slate-300">
              <div>
                <span className="text-slate-500">Voucher No:</span>{' '}
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {expense.voucherNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Disbursal Date:</span>{' '}
                <span className="font-semibold text-slate-800">{formatDate(expense.date)}</span>
              </div>
            </div>

            {/* Main Voucher Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-36 text-xs font-medium">
                  Paid to (Payee / Vendor):
                </span>
                <span className="font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5 text-base">
                  {expense.payeeName}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-36 text-xs font-medium">
                  Expenditure Head:
                </span>
                <span className="font-semibold text-slate-800 border-b border-dotted border-slate-300 flex-1 pb-0.5">
                  {expense.category}
                </span>
              </div>

              {expense.invoiceNumber && (
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="text-slate-500 min-w-36 font-medium">Bill / Memo Ref:</span>
                  <span className="font-mono text-slate-700 border-b border-dotted border-slate-300 flex-1 pb-0.5">
                    {expense.invoiceNumber}
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-36 text-xs font-medium">
                  Amount in Words:
                </span>
                <span className="font-semibold text-rose-900 italic border-b border-dotted border-slate-300 flex-1 pb-0.5 text-xs">
                  {amountToWords(expense.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="text-slate-500">Disbursal Mode:</span>
                  <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {expense.paymentMode}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 text-xs justify-end">
                  <span className="text-slate-500">Paid by:</span>
                  <span className="font-semibold text-slate-800">{expense.paidBy}</span>
                </div>
              </div>

              {expense.notes && (
                <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <strong className="text-slate-700">Particulars:</strong> {expense.notes}
                </div>
              )}
            </div>

            {/* Total Amount Disbursed */}
            <div className="mt-5 flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-200">
              <div className="text-xs text-rose-900 font-bold uppercase tracking-wider">
                Total Amount Paid:
              </div>
              <div className="text-2xl font-black text-rose-950 font-mono tracking-tight">
                {formatCurrency(expense.amount, settings.currency)}
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-8 pt-4 grid grid-cols-3 text-center text-xs border-t border-slate-200 gap-4">
              <div>
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1 text-slate-700 font-medium truncate">
                  {expense.payeeName}
                </div>
                <div className="text-[10px] text-slate-400">Payee Signature / Stamp</div>
              </div>
              <div>
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1 text-slate-700 font-medium truncate">
                  {expense.paidBy}
                </div>
                <div className="text-[10px] text-slate-400">Treasurer Disbursal</div>
              </div>
              <div>
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1 text-slate-700 font-medium truncate">
                  {expense.authorizedBy}
                </div>
                <div className="text-[10px] text-slate-400">President Approval</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="print:hidden bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Isolated print mode &bull; Only this voucher
            will be printed
          </span>
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
