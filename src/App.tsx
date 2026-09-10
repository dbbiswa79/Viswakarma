import React, { useState, useEffect } from 'react';
import {
  PujaManagementState,
  UserAccount,
  IncomeRecord,
  ExpenseRecord,
  Member,
  CommitteeSettings,
  canEditData,
} from './types';
import { storageService } from './services/storageService';
import { excelService } from './services/excelService';
import { standaloneHtmlService } from './services/standaloneHtmlService';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { IncomeView } from './components/IncomeView';
import { ExpenseView } from './components/ExpenseView';
import { MembersView } from './components/MembersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { ExpenseVoucherPrintModal } from './components/ExpenseVoucherPrintModal';
import { AuditReportPrintModal } from './components/AuditReportPrintModal';
import { ShieldAlert, KeyRound, Sparkles } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<PujaManagementState>(() =>
    storageService.getInitialState()
  );
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = storageService.getCurrentUser();
    // Default to admin user for immediate seamless desktop access
    return saved || storageService.getInitialState().users[0];
  });

  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'income' | 'expense' | 'members' | 'reports' | 'settings'
  >('dashboard');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);
  const [selectedIncomeForReceipt, setSelectedIncomeForReceipt] =
    useState<IncomeRecord | null>(null);
  const [selectedExpenseForVoucher, setSelectedExpenseForVoucher] =
    useState<ExpenseRecord | null>(null);
  const [isAuditReportModalOpen, setIsAuditReportModalOpen] = useState(false);

  // Quick action shortcut triggers
  const [triggerIncomeAdd, setTriggerIncomeAdd] = useState(false);
  const [triggerExpenseAdd, setTriggerExpenseAdd] = useState(false);
  const [triggerMemberAdd, setTriggerMemberAdd] = useState(false);

  // Central Role-Based Authorization
  const canEdit = canEditData(currentUser?.role);

  // Synchronize state changes to localStorage
  const updateStateAndPersist = (updater: (prev: PujaManagementState) => PujaManagementState) => {
    setAppState((prev) => {
      const next = updater(prev);
      storageService.saveState(next);
      return next;
    });
  };

  // Check if default admin needs password change
  const isDefaultAdminNeedsPasswordChange =
    currentUser?.username === 'admin' && currentUser?.mustChangePassword === true;

  // Handle Login
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
    setIsLoginModalOpen(false);

    // If default admin, prompt to change password immediately
    if (user.mustChangePassword) {
      setTimeout(() => {
        setIsChangePasswordModalOpen(true);
      }, 300);
    }
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // Handle Password Change
  const handlePasswordChanged = (newPassword: string) => {
    if (!currentUser) return;

    updateStateAndPersist((prev) => {
      const updatedUsers = prev.users.map((u) =>
        u.id === currentUser.id
          ? { ...u, passwordHash: newPassword, mustChangePassword: false }
          : u
      );
      const updatedCurrentUser = {
        ...currentUser,
        passwordHash: newPassword,
        mustChangePassword: false,
      };
      setCurrentUser(updatedCurrentUser);
      storageService.setCurrentUser(updatedCurrentUser);

      const logItem = {
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'Password Changed',
        details: `User ${currentUser.username} updated security password.`,
        user: currentUser.username,
      };

      return {
        ...prev,
        users: updatedUsers,
        auditLogs: [...prev.auditLogs, logItem],
      };
    });
  };

  // Handle Settings Update
  const handleSaveSettings = (newSettings: CommitteeSettings) => {
    if (!canEditData(currentUser?.role)) return;
    updateStateAndPersist((prev) => ({
      ...prev,
      settings: newSettings,
      auditLogs: [
        ...prev.auditLogs,
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Settings Updated',
          details: `Committee config modified. Budget: ${newSettings.currency}${newSettings.targetBudget}`,
          user: currentUser?.username || 'admin',
        },
      ],
    }));
  };

  // Handle Income actions
  const handleAddIncome = (incomeData: Omit<IncomeRecord, 'id' | 'createdAt'>) => {
    if (!canEditData(currentUser?.role)) return;
    const newId = 'inc_' + Date.now();
    const newRecord: IncomeRecord = {
      ...incomeData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    updateStateAndPersist((prev) => {
      // If linked to member, increment member's contributedAmount
      let updatedMembers = prev.members;
      if (newRecord.memberId) {
        updatedMembers = prev.members.map((m) =>
          m.id === newRecord.memberId
            ? { ...m, contributedAmount: m.contributedAmount + newRecord.amount }
            : m
        );
      }

      return {
        ...prev,
        incomes: [newRecord, ...prev.incomes],
        members: updatedMembers,
        auditLogs: [
          ...prev.auditLogs,
          {
            id: 'log_' + Date.now(),
            timestamp: new Date().toISOString(),
            action: 'Income Created',
            details: `Receipt ${newRecord.receiptNumber} (${newRecord.category}) of ${newRecord.amount} from ${newRecord.donorName}`,
            user: currentUser?.username || 'admin',
          },
        ],
      };
    });

    // Auto prompt receipt preview
    setSelectedIncomeForReceipt(newRecord);
  };

  const handleBatchImportIncome = (
    toAdd: Array<Omit<IncomeRecord, 'id' | 'createdAt'>>,
    toUpdate: Array<IncomeRecord>
  ) => {
    if (!canEditData(currentUser?.role)) return;

    updateStateAndPersist((prev) => {
      const now = new Date();
      const ts = now.getTime();

      const newRecords: IncomeRecord[] = toAdd.map((item, idx) => ({
        ...item,
        id: 'inc_' + (ts + idx) + '_' + Math.random().toString(36).substring(2, 6),
        createdAt: now.toISOString(),
      }));

      // Map for fast lookup/replacement of updated records
      const updateMap = new Map<string, IncomeRecord>();
      toUpdate.forEach((u) => updateMap.set(u.id, u));

      // Build new incomes array: updated existing records + new additions at the beginning
      const updatedExistingIncomes = prev.incomes.map((i) =>
        updateMap.has(i.id) ? updateMap.get(i.id)! : i
      );
      const finalIncomes = [...newRecords, ...updatedExistingIncomes];

      // Recompute contributedAmount accurately for all members based on linked incomes
      const memberContributionSums = new Map<string, number>();
      finalIncomes.forEach((i) => {
        if (i.memberId) {
          const current = memberContributionSums.get(i.memberId) || 0;
          memberContributionSums.set(i.memberId, current + i.amount);
        }
      });

      const updatedMembers = prev.members.map((m) => ({
        ...m,
        contributedAmount: memberContributionSums.get(m.id) ?? 0,
      }));

      const totalImportedAmt =
        toAdd.reduce((s, a) => s + a.amount, 0) +
        toUpdate.reduce((s, u) => s + u.amount, 0);

      return {
        ...prev,
        incomes: finalIncomes,
        members: updatedMembers,
        auditLogs: [
          ...prev.auditLogs,
          {
            id: 'log_' + Date.now(),
            timestamp: now.toISOString(),
            action: 'Income Batch Imported',
            details: `Imported from Excel: ${toAdd.length} added, ${toUpdate.length} updated. Total volume: ${prev.settings.currency}${totalImportedAmt}`,
            user: currentUser?.username || 'admin',
          },
        ],
      };
    });
  };

  const handleUpdateIncome = (updatedRecord: IncomeRecord) => {
    if (!canEditData(currentUser?.role)) return;
    updateStateAndPersist((prev) => ({
      ...prev,
      incomes: prev.incomes.map((i) => (i.id === updatedRecord.id ? updatedRecord : i)),
      auditLogs: [
        ...prev.auditLogs,
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Income Updated',
          details: `Receipt ${updatedRecord.receiptNumber} modified`,
          user: currentUser?.username || 'admin',
        },
      ],
    }));
  };

  const handleDeleteIncome = (id: string) => {
    if (!canEditData(currentUser?.role)) return;
    updateStateAndPersist((prev) => {
      const target = prev.incomes.find((i) => i.id === id);
      let updatedMembers = prev.members;
      if (target && target.memberId) {
        updatedMembers = prev.members.map((m) =>
          m.id === target.memberId
            ? { ...m, contributedAmount: Math.max(0, m.contributedAmount - target.amount) }
            : m
        );
      }
      return {
        ...prev,
        incomes: prev.incomes.filter((i) => i.id !== id),
        members: updatedMembers,
        auditLogs: [
          ...prev.auditLogs,
          {
            id: 'log_' + Date.now(),
            timestamp: new Date().toISOString(),
            action: 'Income Deleted',
            details: `Receipt ${target?.receiptNumber || id} removed`,
            user: currentUser?.username || 'admin',
          },
        ],
      };
    });
  };

  // Handle Expense actions
  const handleAddExpense = (expenseData: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    if (!canEditData(currentUser?.role)) return;
    const newId = 'exp_' + Date.now();
    const newRecord: ExpenseRecord = {
      ...expenseData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      expenses: [newRecord, ...prev.expenses],
      auditLogs: [
        ...prev.auditLogs,
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Expense Voucher Created',
          details: `Voucher ${newRecord.voucherNumber} (${newRecord.category}) of ${newRecord.amount} to ${newRecord.payeeName}`,
          user: currentUser?.username || 'admin',
        },
      ],
    }));

    // Auto prompt voucher preview
    setSelectedExpenseForVoucher(newRecord);
  };

  const handleUpdateExpense = (updatedRecord: ExpenseRecord) => {
    if (!canEditData(currentUser?.role)) return;
    updateStateAndPersist((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === updatedRecord.id ? updatedRecord : e)),
      auditLogs: [
        ...prev.auditLogs,
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Expense Updated',
          details: `Voucher ${updatedRecord.voucherNumber} modified`,
          user: currentUser?.username || 'admin',
        },
      ],
    }));
  };

  const handleDeleteExpense = (id: string) => {
    if (!canEditData(currentUser?.role)) return;
    updateStateAndPersist((prev) => {
      const target = prev.expenses.find((e) => e.id === id);
      return {
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
        auditLogs: [
          ...prev.auditLogs,
          {
            id: 'log_' + Date.now(),
            timestamp: new Date().toISOString(),
            action: 'Expense Deleted',
            details: `Voucher ${target?.voucherNumber || id} removed`,
            user: currentUser?.username || 'admin',
          },
        ],
      };
    });
  };

  // Handle Member actions
  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    if (!canEditData(currentUser?.role)) return;
    const newId = 'mem_' + Date.now();
    const newMember: Member = {
      ...memberData,
      id: newId,
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
      auditLogs: [
        ...prev.auditLogs,
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Member Registered',
          details: `${newMember.fullName} registered as ${newMember.designation} (${newMember.memberCode})`,
          user: currentUser?.username || 'admin',
        },
      ],
    }));
  };

  const handleUpdateMember = (updatedMember: Member) => {
    if (!canEditData(currentUser?.role)) return;
    updateStateAndPersist((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === updatedMember.id ? updatedMember : m)),
      auditLogs: [
        ...prev.auditLogs,
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Member Updated',
          details: `${updatedMember.fullName} details updated`,
          user: currentUser?.username || 'admin',
        },
      ],
    }));
  };

  const handleDeleteMember = (id: string) => {
    if (!canEditData(currentUser?.role)) return;
    updateStateAndPersist((prev) => {
      const target = prev.members.find((m) => m.id === id);
      return {
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
        auditLogs: [
          ...prev.auditLogs,
          {
            id: 'log_' + Date.now(),
            timestamp: new Date().toISOString(),
            action: 'Member Removed',
            details: `${target?.fullName || id} deleted from directory`,
            user: currentUser?.username || 'admin',
          },
        ],
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Top Warning Banner if Default Admin Password is still in use */}
      {isDefaultAdminNeedsPasswordChange && (
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xs print:hidden">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-200 shrink-0" />
              <span>
                <strong>Action Required:</strong> Logged in with default admin credentials (<code className="bg-amber-900/50 px-1 py-0.5 rounded font-mono">admin123</code>).
                Please change your password now to secure your local committee ledger.
              </span>
            </div>
            <button
              id="btn-banner-change-password"
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="px-3 py-1 bg-white text-amber-900 hover:bg-amber-50 font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Change Password Now
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        settings={appState.settings}
        onOpenExcelExport={() => excelService.exportCompletePujaWorkbook(appState)}
        onOpenSaveHtml={() => standaloneHtmlService.downloadStandaloneApp(appState)}
        onOpenBackupRestore={() => setIsBackupRestoreModalOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            state={appState}
            onOpenAddIncome={() => {
              setCurrentTab('income');
              setTriggerIncomeAdd(true);
            }}
            onOpenAddExpense={() => {
              setCurrentTab('expense');
              setTriggerExpenseAdd(true);
            }}
            onOpenAddMember={() => {
              setCurrentTab('members');
              setTriggerMemberAdd(true);
            }}
            onSelectIncomeReceipt={(rec) => setSelectedIncomeForReceipt(rec)}
            onSelectExpenseVoucher={(rec) => setSelectedExpenseForVoucher(rec)}
            onOpenAuditReport={() => setIsAuditReportModalOpen(true)}
            onOpenExcelExport={() => excelService.exportCompletePujaWorkbook(appState)}
            canEdit={canEdit}
          />
        )}

        {currentTab === 'income' && (
          <IncomeView
            incomes={appState.incomes}
            members={appState.members}
            settings={appState.settings}
            currentUser={currentUser}
            onAddIncome={handleAddIncome}
            onUpdateIncome={handleUpdateIncome}
            onDeleteIncome={handleDeleteIncome}
            onPrintReceipt={(rec) => setSelectedIncomeForReceipt(rec)}
            onBatchImportIncome={handleBatchImportIncome}
            initialOpenModal={triggerIncomeAdd}
            onCloseInitialModal={() => setTriggerIncomeAdd(false)}
            canEdit={canEdit}
          />
        )}

        {currentTab === 'expense' && (
          <ExpenseView
            expenses={appState.expenses}
            settings={appState.settings}
            currentUser={currentUser}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onPrintVoucher={(rec) => setSelectedExpenseForVoucher(rec)}
            initialOpenModal={triggerExpenseAdd}
            onCloseInitialModal={() => setTriggerExpenseAdd(false)}
            canEdit={canEdit}
          />
        )}

        {currentTab === 'members' && (
          <MembersView
            members={appState.members}
            settings={appState.settings}
            currentUser={currentUser}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onQuickContribute={(member) => {
              setCurrentTab('income');
              setTriggerIncomeAdd(true);
            }}
            initialOpenModal={triggerMemberAdd}
            onCloseInitialModal={() => setTriggerMemberAdd(false)}
            canEdit={canEdit}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            state={appState}
            onOpenAuditPrintModal={() => setIsAuditReportModalOpen(true)}
            onOpenExcelExport={() => excelService.exportCompletePujaWorkbook(appState)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={appState.settings}
            users={appState.users}
            auditLogs={appState.auditLogs}
            currentUser={currentUser}
            onSaveSettings={handleSaveSettings}
            onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
            canEdit={canEdit}
          />
        )}
      </main>

      {/* Global Modals */}
      {isLoginModalOpen && (
        <LoginModal
          users={appState.users}
          onLoginSuccess={handleLoginSuccess}
          canCancel={currentUser !== null}
          onCancel={() => setIsLoginModalOpen(false)}
        />
      )}

      {isChangePasswordModalOpen && currentUser && (
        <ChangePasswordModal
          currentUser={currentUser}
          onPasswordChanged={handlePasswordChanged}
          onClose={() => setIsChangePasswordModalOpen(false)}
          isMandatory={isDefaultAdminNeedsPasswordChange}
        />
      )}

      {isBackupRestoreModalOpen && (
        <BackupRestoreModal
          state={appState}
          onStateRestored={(newState) => setAppState(newState)}
          onClose={() => setIsBackupRestoreModalOpen(false)}
        />
      )}

      {selectedIncomeForReceipt && (
        <ReceiptPrintModal
          income={selectedIncomeForReceipt}
          settings={appState.settings}
          onClose={() => setSelectedIncomeForReceipt(null)}
        />
      )}

      {selectedExpenseForVoucher && (
        <ExpenseVoucherPrintModal
          expense={selectedExpenseForVoucher}
          settings={appState.settings}
          onClose={() => setSelectedExpenseForVoucher(null)}
        />
      )}

      {isAuditReportModalOpen && (
        <AuditReportPrintModal
          state={appState}
          onClose={() => setIsAuditReportModalOpen(false)}
        />
      )}
    </div>
  );
}
