import {
  PujaManagementState,
  CommitteeSettings,
  UserAccount,
  Member,
  IncomeRecord,
  ExpenseRecord,
  AuditLogItem,
} from '../types';

const STORAGE_KEY = 'BISHWAKARMA_PUJA_COMMITTEE_DATA_V2';
const CURRENT_USER_KEY = 'BISHWAKARMA_PUJA_CURRENT_USER';

export const DEFAULT_SETTINGS: CommitteeSettings = {
  committeeName: 'Shree Shree Bishwakarma Puja Samiti',
  pujaYear: '2025-2026',
  tagline: 'Divine Architect of the Universe — Devotion, Craftsmanship & Unity',
  registrationNumber: 'REG/BKPS/2025-94',
  venue: 'Main Workshop Complex & Pandal Ground',
  city: 'Industrial Estate, Sector 4',
  currency: '₹',
  targetBudget: 350000,
  presidentName: 'Sri Rajesh Sharma',
  secretaryName: 'Sri Amit Kumar Verma',
  treasurerName: 'Sri Manoj Vishwakarma',
  auditorName: 'Sri Sanjeev Roy (Chartered Auditor)',
  contactPhone: '9437080999',
  contactEmail: 'committee@bishwakarmapuja.org',
  receiptPrefix: 'BK-REC',
  expensePrefix: 'BK-EXP',
  upiId: 'bishwakarma.puja@upi',
  bankDetails: {
    accountName: 'Shree Shree Bishwakarma Puja Samiti',
    accountNumber: '304928109283',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0001234',
    branch: 'Industrial Area Branch',
  },
  blessingMessage:
    'May Lord Bishwakarma, the divine celestial craftsman, shower divine blessings of skill, prosperity, mechanical safety, and abundant growth upon you and your family.',
};

export const DEFAULT_ADMIN: UserAccount = {
  id: 'usr_admin_01',
  username: 'admin',
  fullName: 'Committee System Administrator',
  role: 'admin',
  passwordHash: 'admin123',
  mustChangePassword: false,
  createdAt: '2025-08-01T10:00:00.000Z',
};

export const DEFAULT_SECRETARY: UserAccount = {
  id: 'usr_secretary_01',
  username: 'secretary',
  fullName: 'Sri Amit Kumar Verma (General Secretary)',
  role: 'secretary',
  passwordHash: 'admin123',
  createdAt: '2025-08-01T10:00:00.000Z',
};

export const DEFAULT_TREASURER: UserAccount = {
  id: 'usr_treasurer_01',
  username: 'treasurer',
  fullName: 'Sri Manoj Vishwakarma (Treasurer)',
  role: 'treasurer',
  passwordHash: 'admin123',
  createdAt: '2025-08-01T10:00:00.000Z',
};

export const DEFAULT_EDITOR: UserAccount = {
  id: 'usr_editor_01',
  username: 'editor',
  fullName: 'Sri Pradeep Roy (Records & Editorial In-charge)',
  role: 'editor',
  passwordHash: 'admin123',
  createdAt: '2025-08-01T10:00:00.000Z',
};

export const DEFAULT_AUDITOR: UserAccount = {
  id: 'usr_auditor_01',
  username: 'auditor',
  fullName: 'Sri Sanjeev Roy (Chartered Auditor)',
  role: 'auditor',
  passwordHash: 'admin123',
  createdAt: '2025-08-01T10:00:00.000Z',
};

export const INITIAL_USERS: UserAccount[] = [
  DEFAULT_ADMIN,
  DEFAULT_SECRETARY,
  DEFAULT_TREASURER,
  DEFAULT_EDITOR,
  DEFAULT_AUDITOR,
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem_01',
    memberCode: 'MEM-001',
    fullName: 'Sri Rajesh Sharma',
    designation: 'President',
    phone: '9830112233',
    address: 'Flat 3B, Engineers Enclave',
    bloodGroup: 'B+',
    contributedAmount: 15000,
    status: 'active',
    joinedDate: '2025-08-01',
    notes: 'Overall supervision and pandal permissions',
  },
  {
    id: 'mem_02',
    memberCode: 'MEM-002',
    fullName: 'Sri Amit Kumar Verma',
    designation: 'General Secretary',
    phone: '9830223344',
    address: 'Plot 12, Workers Colony',
    bloodGroup: 'O+',
    contributedAmount: 10000,
    status: 'active',
    joinedDate: '2025-08-01',
    notes: 'Administration & municipal coordination',
  },
  {
    id: 'mem_03',
    memberCode: 'MEM-003',
    fullName: 'Sri Manoj Vishwakarma',
    designation: 'Treasurer',
    phone: '9830334455',
    address: 'House 8, Artisan Nagar',
    bloodGroup: 'A+',
    contributedAmount: 10000,
    status: 'active',
    joinedDate: '2025-08-01',
    notes: 'Daily accounts and cash maintenance',
  },
  {
    id: 'mem_04',
    memberCode: 'MEM-004',
    fullName: 'Sri Pradeep Mistri',
    designation: 'Pandal & Decoration Lead',
    phone: '9830445566',
    address: 'Industrial Gate No. 2',
    bloodGroup: 'AB+',
    contributedAmount: 5000,
    status: 'active',
    joinedDate: '2025-08-05',
    notes: 'Pandal erection and artisan team manager',
  },
  {
    id: 'mem_05',
    memberCode: 'MEM-005',
    fullName: 'Sri Dilip Kumar Sen',
    designation: 'Prasad & Bhog Coordinator',
    phone: '9830556677',
    address: 'Station Road',
    bloodGroup: 'O+',
    contributedAmount: 7000,
    status: 'active',
    joinedDate: '2025-08-08',
    notes: 'Mahaprasad cooking and distribution lead',
  },
  {
    id: 'mem_06',
    memberCode: 'MEM-006',
    fullName: 'Sri Rahul Karmakar',
    designation: 'Volunteer',
    phone: '9830667788',
    address: 'Tech Park Quarter 14',
    bloodGroup: 'B+',
    contributedAmount: 3000,
    status: 'active',
    joinedDate: '2025-08-10',
    notes: 'Sound system, social media and lighting volunteer',
  },
  {
    id: 'mem_07',
    memberCode: 'MEM-007',
    fullName: 'Mr Biswaranjan',
    designation: 'Executive Committee Member & Key Patron',
    phone: '9437080999',
    address: 'Sector 4, Main Road, Committee Office',
    bloodGroup: 'O+',
    contributedAmount: 11000,
    status: 'active',
    joinedDate: '2025-08-01',
    notes: 'Key patron, executive committee coordination & chanda support',
  },
];

export const INITIAL_INCOMES: IncomeRecord[] = [
  {
    id: 'inc_01',
    receiptNumber: 'BK-REC-2025-001',
    date: '2025-08-12',
    donorName: 'Sri Rajesh Sharma',
    memberId: 'mem_01',
    phone: '9830112233',
    address: 'Engineers Enclave',
    category: 'Member Subscription',
    amount: 15000,
    paymentMode: 'Bank Transfer',
    transactionRef: 'NEFT784920489',
    collectedBy: 'Sri Manoj Vishwakarma',
    notes: 'Annual membership & puja subscription',
    createdAt: '2025-08-12T11:00:00.000Z',
  },
  {
    id: 'inc_02',
    receiptNumber: 'BK-REC-2025-002',
    date: '2025-08-15',
    donorName: 'Hindustan Heavy Engineering Works',
    phone: '9845012345',
    address: 'Plot 45, Phase II Industrial Zone',
    category: 'VIP / Corporate Sponsor',
    amount: 51000,
    paymentMode: 'Cheque',
    transactionRef: 'CHQ-890214',
    collectedBy: 'Sri Amit Kumar Verma',
    notes: 'Main Stage & Idol Grand Sponsor',
    createdAt: '2025-08-15T14:30:00.000Z',
  },
  {
    id: 'inc_03',
    receiptNumber: 'BK-REC-2025-003',
    date: '2025-08-18',
    donorName: 'Sri Amit Kumar Verma',
    memberId: 'mem_02',
    phone: '9830223344',
    category: 'Member Subscription',
    amount: 10000,
    paymentMode: 'UPI / QR Code',
    transactionRef: 'UPI-98304910284',
    collectedBy: 'Sri Manoj Vishwakarma',
    notes: 'Executive member contribution',
    createdAt: '2025-08-18T10:15:00.000Z',
  },
  {
    id: 'inc_04',
    receiptNumber: 'BK-REC-2025-004',
    date: '2025-08-20',
    donorName: 'Vishwakarma Machining & Lathe Tools',
    phone: '9740112299',
    address: 'Shed 12, Tool Room Colony',
    category: 'Sound & Light Sponsor',
    amount: 25000,
    paymentMode: 'UPI / QR Code',
    transactionRef: 'UPI-30491823901',
    collectedBy: 'Sri Manoj Vishwakarma',
    notes: 'Illumination & sound stage support',
    createdAt: '2025-08-20T16:20:00.000Z',
  },
  {
    id: 'inc_05',
    receiptNumber: 'BK-REC-2025-005',
    date: '2025-08-22',
    donorName: 'Sri Manoj Vishwakarma',
    memberId: 'mem_03',
    phone: '9830334455',
    category: 'Member Subscription',
    amount: 10000,
    paymentMode: 'Cash',
    collectedBy: 'Sri Amit Kumar Verma',
    notes: 'Treasurer registration fee',
    createdAt: '2025-08-22T09:45:00.000Z',
  },
  {
    id: 'inc_06',
    receiptNumber: 'BK-REC-2025-006',
    date: '2025-08-25',
    donorName: 'Precision Welding & Fabricators',
    phone: '9890123490',
    address: 'Main Highway Bypass',
    category: 'Bhog & Prasad Sponsor',
    amount: 31000,
    paymentMode: 'Bank Transfer',
    transactionRef: 'IMPS-202598341',
    collectedBy: 'Sri Dilip Kumar Sen',
    notes: 'Full day community Mahaprasad sponsorship',
    createdAt: '2025-08-25T13:00:00.000Z',
  },
  {
    id: 'inc_07',
    receiptNumber: 'BK-REC-2025-007',
    date: '2025-08-28',
    donorName: 'Local Auto Mechanics & Drivers Union',
    phone: '9712340099',
    address: 'Bus Stand Stand No. 1',
    category: 'Chanda / General Donation',
    amount: 18500,
    paymentMode: 'Cash',
    collectedBy: 'Sri Rahul Karmakar',
    notes: 'Vehicle owners & drivers community chanda',
    createdAt: '2025-08-28T18:00:00.000Z',
  },
  {
    id: 'inc_08',
    receiptNumber: 'BK-REC-2025-008',
    date: '2025-08-29',
    donorName: 'Mr Biswaranjan',
    memberId: 'mem_07',
    phone: '9437080999',
    address: 'Sector 4, Main Road, Committee Office',
    category: 'Member Subscription',
    amount: 11000,
    paymentMode: 'UPI / QR Code',
    transactionRef: 'UPI-9437080999-BK',
    collectedBy: 'Sri Manoj Vishwakarma',
    notes: 'Bishwakarma Puja Member Chanda & Special Subscription',
    createdAt: '2025-08-29T11:00:00.000Z',
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp_01',
    voucherNumber: 'BK-EXP-2025-001',
    date: '2025-08-10',
    payeeName: 'Kumartuli / Traditional Sculptor Studio',
    category: 'Idol / Murti & Transport',
    amount: 42000,
    paymentMode: 'Bank Transfer',
    invoiceNumber: 'INV-SCULPT-88',
    authorizedBy: 'Sri Rajesh Sharma',
    paidBy: 'Sri Manoj Vishwakarma',
    notes: 'Advance booking for 8-foot clay idol of Lord Bishwakarma with swan vehicle and tools',
    createdAt: '2025-08-10T12:00:00.000Z',
  },
  {
    id: 'exp_02',
    voucherNumber: 'BK-EXP-2025-002',
    date: '2025-08-16',
    payeeName: 'New Royal Decorators & Pandals',
    category: 'Tent, Pandal & Mandap Decor',
    amount: 45000,
    paymentMode: 'UPI / QR Code',
    invoiceNumber: 'PANDAL-094',
    authorizedBy: 'Sri Amit Kumar Verma',
    paidBy: 'Sri Manoj Vishwakarma',
    notes: 'First advance for 60x40 waterproof bamboo pandal with fabric ceiling',
    createdAt: '2025-08-16T15:00:00.000Z',
  },
  {
    id: 'exp_03',
    voucherNumber: 'BK-EXP-2025-003',
    date: '2025-08-21',
    payeeName: 'Sonic Waves Light & Sound',
    category: 'Sound System & DJ / Lighting',
    amount: 22000,
    paymentMode: 'Cash',
    invoiceNumber: 'SL-2025-11',
    authorizedBy: 'Sri Rajesh Sharma',
    paidBy: 'Sri Manoj Vishwakarma',
    notes: 'Advance for JBL sound system, LED gate, serial focus lamps for 3 days',
    createdAt: '2025-08-21T17:30:00.000Z',
  },
  {
    id: 'exp_04',
    voucherNumber: 'BK-EXP-2025-004',
    date: '2025-08-26',
    payeeName: 'National Graphic Offset Printers',
    category: 'Banner, Memento & Printing',
    amount: 6500,
    paymentMode: 'UPI / QR Code',
    invoiceNumber: 'PRNT-3041',
    authorizedBy: 'Sri Amit Kumar Verma',
    paidBy: 'Sri Manoj Vishwakarma',
    notes: 'Receipt books, flex vinyl entry hoardings, invitations & volunteer badges',
    createdAt: '2025-08-26T11:45:00.000Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log_01',
    timestamp: '2025-08-01T10:00:00.000Z',
    action: 'System Initialized',
    details: 'Database created with default administrator and festival ledger initialized',
    user: 'admin',
  },
  {
    id: 'log_02',
    timestamp: '2025-08-10T12:00:00.000Z',
    action: 'Expense Created',
    details: 'Voucher BK-EXP-2025-001 created for Idol advance: ₹42,000',
    user: 'admin',
  },
  {
    id: 'log_03',
    timestamp: '2025-08-15T14:30:00.000Z',
    action: 'Income Created',
    details: 'Receipt BK-REC-2025-002 issued to Hindustan Heavy Engineering: ₹51,000',
    user: 'admin',
  },
];

export const storageService = {
  getInitialState(): PujaManagementState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.settings && parsed.users) {
          // Ensure all standard committee user accounts exist
          let hasMigrated = false;
          if (!parsed.users.some((u: UserAccount) => u.username === 'secretary' || u.role === 'secretary')) {
            parsed.users.push(DEFAULT_SECRETARY);
            hasMigrated = true;
          }
          if (!parsed.users.some((u: UserAccount) => u.username === 'treasurer' || u.role === 'treasurer')) {
            parsed.users.push(DEFAULT_TREASURER);
            hasMigrated = true;
          }
          if (!parsed.users.some((u: UserAccount) => u.username === 'editor' || u.role === 'editor')) {
            parsed.users.push(DEFAULT_EDITOR);
            hasMigrated = true;
          }
          if (!parsed.users.some((u: UserAccount) => u.username === 'auditor' || u.role === 'auditor')) {
            parsed.users.push(DEFAULT_AUDITOR);
            hasMigrated = true;
          }
          if (!parsed.users.some((u: UserAccount) => u.username === 'admin' || u.role === 'admin')) {
            parsed.users.unshift(DEFAULT_ADMIN);
            hasMigrated = true;
          }

          // Standardize default password to 'admin123' across all accounts if using legacy role passwords
          const legacyDefaultPasswords = ['secretary123', 'treasurer123', 'editor123', 'auditor123'];
          parsed.users.forEach((u: UserAccount) => {
            if (legacyDefaultPasswords.includes(u.passwordHash)) {
              u.passwordHash = 'admin123';
              hasMigrated = true;
            }
          });

          // Ensure Mr Biswaranjan (Phone: 9437080999) exists in committee members
          if (
            Array.isArray(parsed.members) &&
            !parsed.members.some(
              (m: Member) =>
                m.phone === '9437080999' ||
                (m.fullName && m.fullName.toLowerCase().includes('biswaranjan'))
            )
          ) {
            const biswaMember: Member = {
              id: 'mem_07',
              memberCode: `MEM-${String(parsed.members.length + 1).padStart(3, '0')}`,
              fullName: 'Mr Biswaranjan',
              designation: 'Executive Committee Member & Key Patron',
              phone: '9437080999',
              address: 'Sector 4, Main Road, Committee Office',
              bloodGroup: 'O+',
              contributedAmount: 11000,
              status: 'active',
              joinedDate: '2025-08-01',
              notes: 'Key patron, executive committee coordination & chanda support',
            };
            parsed.members.push(biswaMember);
            hasMigrated = true;

            // Ensure donation record exists for Mr Biswaranjan
            if (
              Array.isArray(parsed.incomes) &&
              !parsed.incomes.some(
                (i: IncomeRecord) =>
                  i.phone === '9437080999' ||
                  (i.donorName && i.donorName.toLowerCase().includes('biswaranjan'))
              )
            ) {
              parsed.incomes.unshift({
                id: 'inc_08',
                receiptNumber: `BK-REC-2025-${String(parsed.incomes.length + 1).padStart(3, '0')}`,
                date: '2025-08-29',
                donorName: 'Mr Biswaranjan',
                memberId: biswaMember.id,
                phone: '9437080999',
                address: 'Sector 4, Main Road, Committee Office',
                category: 'Member Subscription',
                amount: 11000,
                paymentMode: 'UPI / QR Code',
                transactionRef: 'UPI-9437080999-BK',
                collectedBy: parsed.settings?.treasurerName || 'Sri Manoj Vishwakarma',
                notes: 'Bishwakarma Puja Member Chanda & Special Subscription',
                createdAt: '2025-08-29T11:00:00.000Z',
              });
            }
          }

          if (hasMigrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored committee data:', e);
    }

    const defaultState: PujaManagementState = {
      settings: DEFAULT_SETTINGS,
      users: INITIAL_USERS,
      members: INITIAL_MEMBERS,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      auditLogs: INITIAL_AUDIT_LOGS,
      lastBackupAt: undefined,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    } catch {
      // ignore
    }
    return defaultState;
  },

  saveState(state: PujaManagementState): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Failed to save committee state to localStorage:', e);
      return false;
    }
  },

  getCurrentUser(): UserAccount | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  },

  setCurrentUser(user: UserAccount | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  exportBackupJson(state: PujaManagementState): void {
    const backupData = {
      ...state,
      exportedAt: new Date().toISOString(),
      system: 'Bishwakarma_Puja_Desktop_Management_V2',
      version: '2.0.0',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = state.settings.committeeName
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const dateStamp = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `${safeName}_backup_${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  resetToDefault(): PujaManagementState {
    const defaultState: PujaManagementState = {
      settings: DEFAULT_SETTINGS,
      users: INITIAL_USERS,
      members: INITIAL_MEMBERS,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  },
};
