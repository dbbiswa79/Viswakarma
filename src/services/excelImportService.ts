import * as XLSX from 'xlsx';
import {
  IncomeRecord,
  IncomeCategory,
  PaymentMode,
  CommitteeSettings,
  Member,
} from '../types';

export const VALID_INCOME_CATEGORIES: IncomeCategory[] = [
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

export const VALID_PAYMENT_MODES: PaymentMode[] = [
  'Cash',
  'UPI / QR Code',
  'Bank Transfer',
  'Cheque',
];

export interface ParsedIncomeRow {
  rowNumber: number;
  raw: Record<string, any>;
  status: 'add' | 'update' | 'invalid';
  existingRecord?: IncomeRecord;
  validationErrors: string[];

  // Normalized fields
  receiptNumber: string;
  isReceiptGenerated: boolean;
  date: string;
  donorName: string;
  phone?: string;
  address?: string;
  category: IncomeCategory;
  amount: number;
  paymentMode: PaymentMode;
  transactionRef?: string;
  collectedBy: string;
  notes?: string;
  memberId?: string;
  matchedMemberName?: string;
}

export interface ImportPreviewResult {
  fileName: string;
  sheetNames: string[];
  selectedSheet: string;
  totalRows: number;
  validRows: number;
  addCount: number;
  updateCount: number;
  invalidCount: number;
  totalAmountToAdd: number;
  totalAmountToUpdate: number;
  rows: ParsedIncomeRow[];
}

export type ImportMode = 'smart' | 'addAll' | 'updateOnly';

function normalizeHeaderKey(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function mapToCategory(rawCat: string): IncomeCategory {
  if (!rawCat) return 'Chanda / General Donation';
  const lower = rawCat.toLowerCase().trim();

  if (lower.includes('member') || lower.includes('subscription')) return 'Member Subscription';
  if (lower.includes('idol') || lower.includes('murti')) return 'Idol / Murti Sponsor';
  if (lower.includes('aarti') || lower.includes('offering') || lower.includes('pranam')) return 'Aarti & Puja Offering';
  if (lower.includes('pandal') || lower.includes('decor') || lower.includes('mandap')) return 'Pandal & Decoration Sponsor';
  if (lower.includes('sound') || lower.includes('light') || lower.includes('dj') || lower.includes('mic')) return 'Sound & Light Sponsor';
  if (lower.includes('bhog') || lower.includes('prasad') || lower.includes('sweet') || lower.includes('food')) return 'Bhog & Prasad Sponsor';
  if (lower.includes('stall') || lower.includes('booth') || lower.includes('rent')) return 'Stall / Booth Rental';
  if (lower.includes('cultural') || lower.includes('artist') || lower.includes('drama') || lower.includes('stage')) return 'Cultural Night Donor';
  if (lower.includes('vip') || lower.includes('corporate') || lower.includes('sponsor')) return 'VIP / Corporate Sponsor';
  if (lower.includes('misc')) return 'Miscellaneous';
  if (lower.includes('chanda') || lower.includes('donation') || lower.includes('general')) return 'Chanda / General Donation';

  // Exact check against list
  const matched = VALID_INCOME_CATEGORIES.find(c => c.toLowerCase() === lower);
  return matched || 'Chanda / General Donation';
}

function mapToPaymentMode(rawMode: string): PaymentMode {
  if (!rawMode) return 'Cash';
  const lower = rawMode.toLowerCase().trim();

  if (lower.includes('upi') || lower.includes('qr') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) {
    return 'UPI / QR Code';
  }
  if (lower.includes('bank') || lower.includes('transfer') || lower.includes('neft') || lower.includes('rtgs') || lower.includes('imps') || lower.includes('netbanking')) {
    return 'Bank Transfer';
  }
  if (lower.includes('cheque') || lower.includes('check') || lower.includes('dd')) {
    return 'Cheque';
  }
  return 'Cash';
}

function parseDateValue(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    try {
      const parsed = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch {
      // fallback
    }
  }

  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

function cleanAmount(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val)
    .replace(/[₹$,\s]/g, '')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export const excelImportService = {
  /**
   * Parse an uploaded Excel/CSV file and extract preview rows
   */
  async parseExcelFile(
    file: File,
    existingIncomes: IncomeRecord[],
    members: Member[],
    settings: CommitteeSettings,
    targetSheetName?: string,
    importMode: ImportMode = 'smart'
  ): Promise<ImportPreviewResult> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('The uploaded Excel workbook contains no sheets.');
    }

    // Determine target sheet
    let sheetName = targetSheetName;
    if (!sheetName || !workbook.Sheets[sheetName]) {
      // Try to find a sheet containing 'income' or 'chanda' or 'donation'
      const foundSheet = workbook.SheetNames.find(s => {
        const l = s.toLowerCase();
        return l.includes('income') || l.includes('chanda') || l.includes('donation');
      });
      sheetName = foundSheet || workbook.SheetNames[0];
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in workbook.`);
    }

    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (!rawData || rawData.length === 0) {
      return {
        fileName: file.name,
        sheetNames: workbook.SheetNames,
        selectedSheet: sheetName,
        totalRows: 0,
        validRows: 0,
        addCount: 0,
        updateCount: 0,
        invalidCount: 0,
        totalAmountToAdd: 0,
        totalAmountToUpdate: 0,
        rows: [],
      };
    }

    // Identify headers mapping
    // We map normalized raw key -> standard field
    const parsedRows: ParsedIncomeRow[] = [];
    const year = new Date().getFullYear();
    const prefix = settings.receiptPrefix || 'BK-REC';
    let nextGeneratedSeq = existingIncomes.length + 1;

    // Build fast lookup map for existing incomes by receiptNumber
    const existingMap = new Map<string, IncomeRecord>();
    existingIncomes.forEach(inc => {
      if (inc.receiptNumber) {
        existingMap.set(inc.receiptNumber.trim().toLowerCase(), inc);
      }
    });

    rawData.forEach((row, idx) => {
      const rowNumber = idx + 2; // +2 considering Excel 1-indexed and header row
      const errors: string[] = [];

      // Extract raw values by searching normalized keys
      let rawReceiptNo = '';
      let rawDate: any = '';
      let rawDonor = '';
      let rawPhone = '';
      let rawAddress = '';
      let rawCategory = '';
      let rawAmount: any = '';
      let rawPaymentMode = '';
      let rawTxnRef = '';
      let rawCollectedBy = '';
      let rawNotes = '';
      let rawMemberRef = '';

      Object.entries(row).forEach(([key, val]) => {
        const norm = normalizeHeaderKey(key);
        if (norm.includes('receipt') || norm === 'recno' || norm === 'rec') {
          rawReceiptNo = String(val).trim();
        } else if (norm.includes('date')) {
          rawDate = val;
        } else if (norm.includes('donor') || norm.includes('contributor') || norm === 'name') {
          rawDonor = String(val).trim();
        } else if (norm.includes('phone') || norm.includes('mobile') || norm.includes('contact')) {
          rawPhone = String(val).trim();
        } else if (norm.includes('address') || norm.includes('location') || norm.includes('pandal')) {
          rawAddress = String(val).trim();
        } else if (norm.includes('category') || norm.includes('type')) {
          rawCategory = String(val).trim();
        } else if (norm.includes('amount') || norm.includes('amt') || norm.includes('sum')) {
          rawAmount = val;
        } else if (norm.includes('mode') || norm.includes('paymentmethod')) {
          rawPaymentMode = String(val).trim();
        } else if (norm.includes('txn') || norm.includes('cheque') || norm.includes('ref') || norm.includes('utr')) {
          rawTxnRef = String(val).trim();
        } else if (norm.includes('collected') || norm.includes('collector') || norm.includes('receiver')) {
          rawCollectedBy = String(val).trim();
        } else if (norm.includes('remark') || norm.includes('note') || norm.includes('comment')) {
          rawNotes = String(val).trim();
        } else if (norm.includes('member') || norm === 'code') {
          rawMemberRef = String(val).trim();
        }
      });

      // Validations
      if (!rawDonor) {
        errors.push('Donor / Contributor name is required');
      }

      const parsedAmount = cleanAmount(rawAmount);
      if (parsedAmount <= 0) {
        errors.push('Amount must be greater than 0');
      }

      // Format Date
      const dateStr = parseDateValue(rawDate);

      // Determine Category and Payment Mode
      const category = mapToCategory(rawCategory);
      const paymentMode = mapToPaymentMode(rawPaymentMode);
      const collectedBy = rawCollectedBy || settings.treasurerName || 'Treasurer';

      // Match Member
      let matchedMemberId: string | undefined;
      let matchedMemberName: string | undefined;
      if (rawMemberRef) {
        const memMatch = members.find(
          m =>
            m.memberCode.toLowerCase() === rawMemberRef.toLowerCase() ||
            m.fullName.toLowerCase() === rawMemberRef.toLowerCase() ||
            (m.phone && m.phone === rawMemberRef)
        );
        if (memMatch) {
          matchedMemberId = memMatch.id;
          matchedMemberName = memMatch.fullName;
        }
      } else if (rawDonor) {
        // Try to match member by phone or name
        const memMatch = members.find(
          m =>
            (rawPhone && m.phone && m.phone === rawPhone) ||
            m.fullName.toLowerCase() === rawDonor.toLowerCase()
        );
        if (memMatch) {
          matchedMemberId = memMatch.id;
          matchedMemberName = memMatch.fullName;
        }
      }

      // Determine Add vs Update vs Invalid
      let status: 'add' | 'update' | 'invalid' = 'add';
      let existingRecord: IncomeRecord | undefined;
      let finalReceiptNo = rawReceiptNo;
      let isReceiptGenerated = false;

      if (errors.length > 0) {
        status = 'invalid';
      } else {
        if (rawReceiptNo) {
          const matched = existingMap.get(rawReceiptNo.toLowerCase());
          if (matched) {
            existingRecord = matched;
            if (importMode === 'addAll') {
              // Force add as new
              status = 'add';
              finalReceiptNo = `${prefix}-${year}-${String(nextGeneratedSeq++).padStart(3, '0')}`;
              isReceiptGenerated = true;
            } else {
              // Smart or updateOnly
              status = 'update';
              finalReceiptNo = matched.receiptNumber; // preserve exact case
            }
          } else {
            // Receipt number provided, but doesn't exist in current state
            if (importMode === 'updateOnly') {
              status = 'invalid';
              errors.push(`Receipt No "${rawReceiptNo}" not found in current ledger (Update Only mode active)`);
            } else {
              status = 'add';
              finalReceiptNo = rawReceiptNo;
            }
          }
        } else {
          // No receipt number provided
          if (importMode === 'updateOnly') {
            status = 'invalid';
            errors.push('No Receipt No provided to update (Update Only mode active)');
          } else {
            status = 'add';
            finalReceiptNo = `${prefix}-${year}-${String(nextGeneratedSeq++).padStart(3, '0')}`;
            isReceiptGenerated = true;
          }
        }
      }

      parsedRows.push({
        rowNumber,
        raw: row,
        status,
        existingRecord,
        validationErrors: errors,
        receiptNumber: finalReceiptNo,
        isReceiptGenerated,
        date: dateStr,
        donorName: rawDonor,
        phone: rawPhone || undefined,
        address: rawAddress || undefined,
        category,
        amount: parsedAmount,
        paymentMode,
        transactionRef: rawTxnRef || undefined,
        collectedBy,
        notes: rawNotes || undefined,
        memberId: matchedMemberId,
        matchedMemberName,
      });
    });

    const addCount = parsedRows.filter(r => r.status === 'add').length;
    const updateCount = parsedRows.filter(r => r.status === 'update').length;
    const invalidCount = parsedRows.filter(r => r.status === 'invalid').length;
    const validRows = addCount + updateCount;

    const totalAmountToAdd = parsedRows
      .filter(r => r.status === 'add')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalAmountToUpdate = parsedRows
      .filter(r => r.status === 'update')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      fileName: file.name,
      sheetNames: workbook.SheetNames,
      selectedSheet: sheetName,
      totalRows: parsedRows.length,
      validRows,
      addCount,
      updateCount,
      invalidCount,
      totalAmountToAdd,
      totalAmountToUpdate,
      rows: parsedRows,
    };
  },

  /**
   * Download a rich, formatted Excel template with instructions and sample rows
   */
  downloadIncomeImportTemplate(settings: CommitteeSettings, members: Member[]): void {
    const wb = XLSX.utils.book_new();

    // 1. Main Data Sheet
    const headers = [
      'Receipt No',
      'Date',
      'Donor / Contributor Name',
      'Phone',
      'Address',
      'Category',
      'Amount',
      'Payment Mode',
      'Txn / Cheque Ref',
      'Collected By',
      'Remarks',
      'Member Code',
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    const prefix = settings.receiptPrefix || 'BK-REC';
    const year = new Date().getFullYear();

    const sampleRows = [
      [
        '', // Blank for auto-generated receipt number (ADD)
        todayStr,
        'Shyamal Sen',
        '9830123456',
        'Flat 3A, Lake View Apts, Kolkata',
        'Chanda / General Donation',
        2500,
        'Cash',
        '',
        settings.treasurerName || 'Treasurer',
        'Puja Chanda contribution for 2026',
        '',
      ],
      [
        `${prefix}-${year}-001`, // Existing receipt number to demonstrate UPDATE
        todayStr,
        'Anirban Mukherjee',
        '9876543210',
        '14/B Central Road',
        'Aarti & Puja Offering',
        5001,
        'UPI / QR Code',
        'UPI-9827364521',
        settings.treasurerName || 'Treasurer',
        'Offering for Pushpanjali and Bhog',
        members.length > 0 ? members[0].memberCode : '',
      ],
      [
        '',
        todayStr,
        'M/s Roy & Sons Jewellers',
        '9433011223',
        'Main Bazaar, Sector 1',
        'VIP / Corporate Sponsor',
        15000,
        'Bank Transfer',
        'NEFT-BK482019',
        settings.presidentName || 'President',
        'Main Pandal Gate Banner sponsorship',
        '',
      ],
    ];

    const wsData = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

    // Set column widths for ease of editing
    wsData['!cols'] = [
      { wch: 18 }, // Receipt No
      { wch: 14 }, // Date
      { wch: 28 }, // Donor Name
      { wch: 15 }, // Phone
      { wch: 30 }, // Address
      { wch: 26 }, // Category
      { wch: 14 }, // Amount
      { wch: 16 }, // Payment Mode
      { wch: 20 }, // Txn Ref
      { wch: 20 }, // Collected By
      { wch: 32 }, // Remarks
      { wch: 16 }, // Member Code
    ];

    XLSX.utils.book_append_sheet(wb, wsData, 'Income_Chanda_Import');

    // 2. Instructions Sheet
    const instructionsData = [
      ['BISHWAKARMA PUJA COMMITTEE — EXCEL IMPORT GUIDE'],
      ['Committee Name:', settings.committeeName],
      ['Puja Year / Edition:', settings.pujaYear],
      [],
      ['HOW TO ADD NEW INCOME & CHANDA:'],
      ['• Leave the "Receipt No" column blank, OR provide a new unique receipt number.'],
      ['• The importer will automatically assign next sequential receipt numbers like ' + prefix + '-' + year + '-XXX.'],
      ['• Donor / Contributor Name and Amount (> 0) are mandatory.'],
      [],
      ['HOW TO UPDATE EXISTING RECORDS:'],
      ['• Enter the exact existing "Receipt No" (e.g. ' + prefix + '-' + year + '-001) in the first column.'],
      ['• Any fields you provide (Date, Donor Name, Amount, Mode, Remarks, etc.) will overwrite the existing record in the ledger.'],
      ['• Member total contributions will automatically recalculate!'],
      [],
      ['VALID PAYMENT MODES:'],
      ['1. Cash'],
      ['2. UPI / QR Code (or GPay, PhonePe, Paytm, QR)'],
      ['3. Bank Transfer (or NEFT, IMPS, RTGS, Netbanking)'],
      ['4. Cheque (or Check, DD)'],
      [],
      ['VALID CATEGORIES:'],
      ...VALID_INCOME_CATEGORIES.map((c, i) => [`${i + 1}. ${c}`]),
      [],
      ['REGISTERED COMMITTEE MEMBERS (For Optional "Member Code" column):'],
      ['Code', 'Full Name', 'Designation', 'Phone'],
      ...members.map(m => [m.memberCode, m.fullName, m.designation, m.phone]),
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions_Guide');

    XLSX.writeFile(wb, `Puja_Income_Chanda_Import_Template_${year}.xlsx`);
  },
};
