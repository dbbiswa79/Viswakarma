export type UserRole = 'admin' | 'president' | 'secretary' | 'treasurer' | 'auditor' | 'viewer';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  passwordHash: string; // stored for local offline auth
  mustChangePassword?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CommitteeSettings {
  committeeName: string;
  pujaYear: string;
  tagline: string;
  registrationNumber: string;
  venue: string;
  city: string;
  currency: string;
  targetBudget: number;
  presidentName: string;
  secretaryName: string;
  treasurerName: string;
  auditorName: string;
  contactPhone: string;
  contactEmail: string;
  receiptPrefix: string;
  expensePrefix: string;
  upiId?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branch: string;
  };
  blessingMessage: string;
}

export type MemberDesignation =
  | 'President'
  | 'General Secretary'
  | 'Treasurer'
  | 'Vice President'
  | 'Joint Secretary'
  | 'Cultural In-charge'
  | 'Pandal & Decoration Lead'
  | 'Prasad & Bhog Coordinator'
  | 'Executive Member'
  | 'Advisor'
  | 'Volunteer'
  | 'Patron / Senior Member';

export interface Member {
  id: string;
  memberCode: string;
  fullName: string;
  designation: MemberDesignation;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  pledgeAmount?: number;
  contributedAmount: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  notes?: string;
}

/**
 * Strict role-based authorization check:
 * Only Admin, Secretary, and Treasurer are allowed to edit, add, or delete data.
 */
export const canEditData = (role?: UserRole): boolean => {
  return role === 'admin' || role === 'secretary' || role === 'treasurer';
};

export type IncomeCategory =
  | 'Chanda / General Donation'
  | 'Member Subscription'
  | 'Idol / Murti Sponsor'
  | 'Aarti & Puja Offering'
  | 'Pandal & Decoration Sponsor'
  | 'Sound & Light Sponsor'
  | 'Bhog & Prasad Sponsor'
  | 'Stall / Booth Rental'
  | 'Cultural Night Donor'
  | 'VIP / Corporate Sponsor'
  | 'Miscellaneous';

export type PaymentMode = 'Cash' | 'UPI / QR Code' | 'Bank Transfer' | 'Cheque';

export interface IncomeRecord {
  id: string;
  receiptNumber: string;
  date: string;
  donorName: string;
  memberId?: string;
  phone?: string;
  address?: string;
  category: IncomeCategory;
  amount: number;
  paymentMode: PaymentMode;
  transactionRef?: string;
  collectedBy: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Idol / Murti & Transport'
  | 'Priest & Purohit Dakshina'
  | 'Tent, Pandal & Mandap Decor'
  | 'Sound System & DJ / Lighting'
  | 'Flowers & Puja Samagri'
  | 'Bhog, Prasad & Sweets'
  | 'Cultural Events & Artists'
  | 'Security, Police & Permissions'
  | 'Banner, Memento & Printing'
  | 'Immersion / Bisarjan Procession & Drum/Dhaak'
  | 'Volunteer Refreshments & Meals'
  | 'Electricity & Generator Fuel'
  | 'Sanitation & Cleaning'
  | 'Miscellaneous';

export interface ExpenseRecord {
  id: string;
  voucherNumber: string;
  date: string;
  payeeName: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: PaymentMode;
  invoiceNumber?: string;
  authorizedBy: string;
  paidBy: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
}

export interface PujaManagementState {
  settings: CommitteeSettings;
  users: UserAccount[];
  members: Member[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  auditLogs: AuditLogItem[];
  lastBackupAt?: string;
}
