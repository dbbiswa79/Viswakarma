import React from 'react';
import { UserAccount, CommitteeSettings, canEditData } from '../types';
import {
  LayoutDashboard,
  Coins,
  Receipt,
  Users,
  FileBarChart,
  Settings,
  FileSpreadsheet,
  Download,
  HardDrive,
  KeyRound,
  LogOut,
  ShieldAlert,
  Sparkles,
  WifiOff,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'income' | 'expense' | 'members' | 'reports' | 'settings';
  onTabChange: (tab: 'dashboard' | 'income' | 'expense' | 'members' | 'reports' | 'settings') => void;
  currentUser: UserAccount | null;
  settings: CommitteeSettings;
  onOpenExcelExport: () => void;
  onOpenSaveHtml: () => void;
  onOpenBackupRestore: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  settings,
  onOpenExcelExport,
  onOpenSaveHtml,
  onOpenBackupRestore,
  onOpenChangePassword,
  onLogout,
}) => {
  const isDefaultAdminPassword = currentUser?.mustChangePassword;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-amber-600/50 text-white shadow-lg">
      {/* Top Banner with Committee Identity & Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand / Committee Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-md border border-amber-400">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-black text-amber-400 text-lg leading-tight tracking-wide">
                {settings.committeeName}
              </h1>
              <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {settings.pujaYear}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>{settings.venue}</span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <WifiOff className="w-3 h-3" /> Strict Offline Desktop Mode
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions and User Profile */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Excel Export */}
          <button
            id="btn-nav-export-excel"
            onClick={onOpenExcelExport}
            title="Download complete financial workbook with all sheets (.xlsx)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">Export</span> Excel
          </button>

          {/* Quick Standalone HTML Save */}
          <button
            id="btn-nav-save-html"
            onClick={onOpenSaveHtml}
            title="Save as single-file Bishwakarma_Puja_Management.html for Chrome/Edge"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Save as</span> .HTML
          </button>

          {/* Backup & Restore */}
          <button
            id="btn-nav-backup-restore"
            onClick={onOpenBackupRestore}
            title="Local JSON snapshot backup and restore"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">Backup/Restore</span>
          </button>

          {/* User Account / Password status */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <button
                id="btn-nav-change-pwd"
                onClick={onOpenChangePassword}
                title={
                  isDefaultAdminPassword
                    ? 'Action required: Click to change default password!'
                    : 'Change password'
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isDefaultAdminPassword
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isDefaultAdminPassword ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
                    <span>Change Default Password</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentUser.username}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        canEditData(currentUser.role)
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-600'
                      }`}
                      title={
                        canEditData(currentUser.role)
                          ? 'Allowed to edit data (Admin, Secretary, Treasurer)'
                          : 'View-Only Access (Editing restricted to Admin, Secretary & Treasurer)'
                      }
                    >
                      {currentUser.role} &bull; {canEditData(currentUser.role) ? 'Editor' : 'View-Only'}
                    </span>
                  </>
                )}
              </button>

              <button
                id="btn-nav-logout"
                onClick={onLogout}
                title="Log out / Switch account"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1">
          <button
            id="tab-btn-dashboard"
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard & KPIs
          </button>

          <button
            id="tab-btn-income"
            onClick={() => onTabChange('income')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'income'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            Income & Chanda
          </button>

          <button
            id="tab-btn-expense"
            onClick={() => onTabChange('expense')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'expense'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Expenses & Vouchers
          </button>

          <button
            id="tab-btn-members"
            onClick={() => onTabChange('members')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'members'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Committee Members
          </button>

          <button
            id="tab-btn-reports"
            onClick={() => onTabChange('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'reports'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileBarChart className="w-4 h-4" />
            Financial Audit Reports
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Committee Settings
          </button>
        </div>
      </nav>
    </header>
  );
};
