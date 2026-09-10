import React, { useRef } from 'react';
import { IncomeRecord, CommitteeSettings } from '../types';
import { formatCurrency, formatDate, amountToWords } from '../utils/formatters';
import { Printer, X, CheckCircle2, Copy } from 'lucide-react';

interface ReceiptPrintModalProps {
  income: IncomeRecord | null;
  settings: CommitteeSettings;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  income,
  settings,
  onClose,
}) => {
  const receiptCardRef = useRef<HTMLDivElement>(null);

  if (!income) return null;

  // Pure Isolated Print: creates a clean document containing strictly this receipt
  const handlePrint = () => {
    const cardEl = receiptCardRef.current || document.getElementById('printable-receipt-card');
    if (!cardEl) {
      window.print();
      return;
    }

    try {
      // Create hidden iframe for completely isolated print execution
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

      const receiptHtml = cardEl.outerHTML;

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Receipt_${income.receiptNumber}_${income.donorName.replace(/[^a-zA-Z0-9]/g, '_')}</title>
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
            #printable-receipt-card {
              width: 100%;
              max-width: 760px;
              margin: 0 auto;
              background: #ffffff;
            }
            .border-double-frame {
              border: 3px double #b45309;
              border-radius: 12px;
              padding: 24px;
              background: #fffdfa;
              position: relative;
            }
            .header-text {
              text-align: center;
              border-bottom: 2px solid #fde68a;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .slok {
              font-family: Georgia, serif;
              font-size: 11px;
              color: #b45309;
              letter-spacing: 2px;
              font-weight: bold;
              margin-bottom: 6px;
            }
            .comm-name {
              font-size: 24px;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
              font-family: Georgia, serif;
              line-height: 1.2;
            }
            .venue-meta {
              font-size: 12px;
              color: #475569;
              margin-top: 4px;
              font-weight: 500;
            }
            .badge-pill {
              display: inline-block;
              margin-top: 10px;
              background: #f59e0b;
              color: #0f172a;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 4px 14px;
              border-radius: 9999px;
            }
            .meta-grid {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              padding-bottom: 12px;
              margin-bottom: 14px;
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
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 16px;
              background: #fef3c7;
              border: 1px solid #fcd34d;
              border-radius: 8px;
            }
            .amount-num {
              font-size: 24px;
              font-weight: 900;
              color: #78350f;
              font-family: monospace;
            }
            .blessing {
              text-align: center;
              font-size: 11px;
              color: #92400e;
              font-style: italic;
              margin-top: 16px;
              font-family: Georgia, serif;
            }
            .signature-row {
              margin-top: 36px;
              padding-top: 12px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #e2e8f0;
              text-align: center;
            }
            .sig-box {
              width: 220px;
            }
            .sig-line {
              border-top: 1px solid #64748b;
              padding-top: 4px;
              font-weight: 600;
              font-size: 12px;
              color: #1e293b;
            }
            .sig-sub {
              font-size: 10px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div id="printable-receipt-card">
            <div class="border-double-frame">
              <div class="header-text">
                <div class="slok">|| जय श्री विश्वकर्मा || ॐ विश्वकर्मणे नमः ||</div>
                <h2 class="comm-name">${settings.committeeName}</h2>
                <p class="venue-meta">${settings.venue} &bull; ${settings.city}</p>
                <p style="font-size: 11px; color:#64748b; margin-top:2px;">
                  Reg No: ${settings.registrationNumber || 'N/A'} &bull; Puja Edition: ${settings.pujaYear} ${settings.contactPhone ? '&bull; Phone: ' + settings.contactPhone : ''}
                </p>
                <div class="badge-pill">Official Chanda / Donation Receipt</div>
              </div>

              <div class="meta-grid">
                <div>
                  <span style="color:#64748b;">Receipt No:</span>
                  <strong style="font-family:monospace; font-size:14px; color:#0f172a; margin-left:4px;">${income.receiptNumber}</strong>
                </div>
                <div>
                  <span style="color:#64748b;">Date:</span>
                  <strong style="color:#0f172a; margin-left:4px;">${formatDate(income.date)}</strong>
                </div>
              </div>

              <div class="row-item">
                <span class="label-text">Received with thanks from:</span>
                <span class="dotted-fill" style="font-size:15px;">${income.donorName}</span>
              </div>

              ${income.phone || income.address ? `
              <div class="row-item">
                <span class="label-text">Contact / Address:</span>
                <span class="dotted-fill" style="font-weight:normal; font-size:12px;">${[income.phone, income.address].filter(Boolean).join(' • ')}</span>
              </div>` : ''}

              <div class="row-item">
                <span class="label-text">On Account of:</span>
                <span class="dotted-fill">${income.category}</span>
              </div>

              <div class="row-item">
                <span class="label-text">The Sum of (in words):</span>
                <span class="dotted-fill" style="font-style:italic; color:#78350f; font-weight:600;">${amountToWords(income.amount)}</span>
              </div>

              <div class="row-item" style="margin-top:6px;">
                <span class="label-text">Payment Mode:</span>
                <span class="dotted-fill" style="font-weight:600;">${income.paymentMode} ${income.transactionRef ? '(' + income.transactionRef + ')' : ''}</span>
              </div>

              <div class="amount-box">
                <span style="font-size:12px; font-weight:700; color:#78350f; text-transform:uppercase;">Amount Received:</span>
                <span class="amount-num">${formatCurrency(income.amount, settings.currency)}</span>
              </div>

              <p class="blessing">"${settings.blessingMessage}"</p>

              <div class="signature-row">
                <div class="sig-box">
                  <div style="height:35px;"></div>
                  <div class="sig-line">${income.collectedBy}</div>
                  <div class="sig-sub">Collector / Authorized Signatory</div>
                </div>
                <div class="sig-box">
                  <div style="height:35px;"></div>
                  <div class="sig-line">${settings.treasurerName}</div>
                  <div class="sig-sub">Treasurer / General Secretary</div>
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
    } catch (err) {
      console.warn('Isolated iframe print fallback to standard print', err);
      window.print();
    }
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-sm font-medium text-slate-200">
              Official Donation Receipt Voucher
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-print-receipt-action"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Receipt (Shows Only Receipt)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Body */}
        <div
          ref={receiptCardRef}
          className="p-8 bg-amber-50/40 text-slate-900 relative"
          id="printable-receipt-card"
        >
          {/* Watermark/Border Frame */}
          <div className="border-4 border-double border-amber-600/40 rounded-xl p-6 bg-white shadow-sm relative overflow-hidden">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-500 font-serif text-xs">❖</div>
            <div className="absolute top-2 right-2 text-amber-500 font-serif text-xs">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-500 font-serif text-xs">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-500 font-serif text-xs">❖</div>

            {/* Header */}
            <div className="text-center border-b-2 border-amber-500/30 pb-4 mb-4">
              <div className="text-amber-600 font-serif font-bold text-xs uppercase tracking-widest mb-1">
                || जय श्री विश्वकर्मा || ॐ विश्वकर्मणे नमः ||
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif uppercase">
                {settings.committeeName}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {settings.venue} &bull; {settings.city}
              </p>
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-1">
                <span>
                  <strong>Reg No:</strong> {settings.registrationNumber || 'N/A'}
                </span>
                <span>&bull;</span>
                <span>
                  <strong>Puja Edition:</strong> {settings.pujaYear}
                </span>
                {settings.contactPhone && (
                  <>
                    <span>&bull;</span>
                    <span>
                      <strong>Phone:</strong> {settings.contactPhone}
                    </span>
                  </>
                )}
              </div>

              <div className="inline-block mt-3 px-4 py-1 bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs">
                Official Chanda / Donation Receipt
              </div>
            </div>

            {/* Meta Row: Receipt No and Date */}
            <div className="grid grid-cols-2 text-xs mb-4 pb-3 border-b border-dashed border-slate-200">
              <div>
                <span className="text-slate-500">Receipt No:</span>{' '}
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {income.receiptNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Date:</span>{' '}
                <span className="font-semibold text-slate-800">{formatDate(income.date)}</span>
              </div>
            </div>

            {/* Main Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-32 text-xs font-medium">
                  Received with thanks from:
                </span>
                <span className="font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5 text-base">
                  {income.donorName}
                </span>
              </div>

              {(income.phone || income.address) && (
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="text-slate-500 min-w-32 font-medium">Contact / Address:</span>
                  <span className="text-slate-700 border-b border-dotted border-slate-300 flex-1 pb-0.5">
                    {[income.phone, income.address].filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-32 text-xs font-medium">On Account of:</span>
                <span className="font-semibold text-slate-800 border-b border-dotted border-slate-300 flex-1 pb-0.5">
                  {income.category}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-32 text-xs font-medium">
                  The Sum of (in words):
                </span>
                <span className="font-semibold text-amber-900 italic border-b border-dotted border-slate-300 flex-1 pb-0.5 text-xs">
                  {amountToWords(income.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {income.paymentMode}
                  </span>
                  {income.transactionRef && (
                    <span className="font-mono text-[11px] text-slate-500">
                      ({income.transactionRef})
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 text-xs justify-end">
                  <span className="text-slate-500">Collected By:</span>
                  <span className="font-semibold text-slate-800">{income.collectedBy}</span>
                </div>
              </div>
            </div>

            {/* Big Amount Badge */}
            <div className="mt-6 flex items-center justify-between p-3 bg-amber-100/60 rounded-lg border border-amber-300">
              <div className="text-xs text-amber-900 font-medium">
                <strong>Amount Received:</strong>
              </div>
              <div className="text-2xl font-black text-amber-950 font-mono tracking-tight">
                {formatCurrency(income.amount, settings.currency)}
              </div>
            </div>

            {/* Blessings Note */}
            <p className="text-center text-[11px] text-amber-800 italic mt-4 font-serif">
              "{settings.blessingMessage}"
            </p>

            {/* Signature Area */}
            <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs border-t border-slate-200 gap-8">
              <div>
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1 text-slate-700 font-medium">
                  {income.collectedBy}
                </div>
                <div className="text-[10px] text-slate-400">Collector / Authorized Signatory</div>
              </div>
              <div>
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-1 text-slate-700 font-medium">
                  {settings.treasurerName}
                </div>
                <div className="text-[10px] text-slate-400">Treasurer / General Secretary</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="print:hidden bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Isolated print mode &bull; Only this receipt
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
