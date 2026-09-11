import React, { useRef, useState } from 'react';
import { PujaManagementState } from '../types';
import { storageService } from '../services/storageService';
import { standaloneHtmlService } from '../services/standaloneHtmlService';
import {
  Download,
  Upload,
  FileCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  HardDrive,
} from 'lucide-react';

interface BackupRestoreModalProps {
  state: PujaManagementState;
  onStateRestored: (newState: PujaManagementState) => void;
  onClose: () => void;
  canEdit?: boolean;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  state,
  onStateRestored,
  onClose,
  canEdit = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const handleExportBackup = () => {
    storageService.exportBackupJson(state);
    setRestoreStatus({
      type: 'success',
      msg: 'JSON Backup file exported and downloaded to your computer.',
    });
  };

  const handleDownloadStandaloneHtml = () => {
    standaloneHtmlService.downloadStandaloneApp(state);
    const hasBiswa = state.members.some(
      (m) => m.phone === '9437080999' || m.fullName.toLowerCase().includes('biswaranjan')
    );
    setRestoreStatus({
      type: 'success',
      msg: `Bishwakarma_Puja_Management.html saved! Includes ${hasBiswa ? 'Mr Biswaranjan (9437080999) and ' : ''}all ${state.members.length} committee members & ledger records. Double-click to open in Chrome or Edge without internet.`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.settings || !Array.isArray(parsed.members)) {
          throw new Error('Invalid Bishwakarma Puja backup schema.');
        }

        const restoredState: PujaManagementState = {
          settings: parsed.settings,
          users: parsed.users || state.users,
          members: parsed.members || [],
          incomes: parsed.incomes || [],
          expenses: parsed.expenses || [],
          auditLogs: [
            ...(parsed.auditLogs || []),
            {
              id: 'log_' + Date.now(),
              timestamp: new Date().toISOString(),
              action: 'Data Restored',
              details: `Restored snapshot containing ${parsed.incomes?.length || 0} incomes and ${parsed.expenses?.length || 0} expenses.`,
              user: 'admin',
            },
          ],
          lastBackupAt: new Date().toISOString(),
        };

        storageService.saveState(restoredState);
        onStateRestored(restoredState);
        setRestoreStatus({
          type: 'success',
          msg: `Successfully restored ${restoredState.incomes.length} income records and ${restoredState.expenses.length} expenses!`,
        });
      } catch (err: any) {
        setRestoreStatus({
          type: 'error',
          msg: 'Restore failed: ' + (err.message || 'File corrupted or invalid format.'),
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data back to the default initial sample? Any unsaved local edits will be reset.'
      )
    ) {
      const reset = storageService.resetToDefault();
      onStateRestored(reset);
      setRestoreStatus({
        type: 'success',
        msg: 'Database restored to initial template state.',
      });
    }
  };

  return (
    <div
      id="backup-restore-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Local Data Backup & Standalone HTML</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {restoreStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                restoreStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {restoreStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{restoreStatus.msg}</span>
            </div>
          )}

          {/* Option 1: Standalone Single-file HTML */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wide">
                <FileCode className="w-4 h-4 text-amber-600" />
                <span>Save as "Bishwakarma_Puja_Management.html"</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Generates a single self-contained HTML file with all your committee data and styling.
                You can save it to your desktop and double-click to open in <strong>Chrome</strong> or <strong>Edge</strong> offline.
              </p>
            </div>
            <button
              id="btn-download-standalone-html"
              onClick={handleDownloadStandaloneHtml}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm shrink-0 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              Save .HTML
            </button>
          </div>

          {/* Option 2: Full JSON Database Snapshot */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Export JSON Backup</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Download a full snapshot of all members, receipts, vouchers, and settings as a timestamped JSON file.
                </p>
              </div>
              <button
                id="btn-export-backup-json"
                onClick={handleExportBackup}
                className="mt-4 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                Export Snapshot
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Restore from Backup</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a previously saved <code className="text-slate-800 font-mono">.json</code> backup file to restore committee records.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                {canEdit ? (
                  <button
                    id="btn-trigger-restore-upload"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Select Backup File
                  </button>
                ) : (
                  <div className="mt-4 px-3 py-2 bg-slate-100 text-slate-500 text-[11px] rounded-lg border border-slate-200 text-center font-medium">
                    Restoration restricted to Admin, Secretary & Treasurer
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need to start clean or reload sample data?</span>
            {canEdit ? (
              <button
                onClick={handleResetData}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Defaults
              </button>
            ) : (
              <span className="text-slate-400 text-[11px]">Resetting restricted to Editors</span>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
