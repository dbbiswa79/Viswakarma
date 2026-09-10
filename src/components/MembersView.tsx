import React, { useState, useMemo } from 'react';
import { Member, MemberDesignation, CommitteeSettings, UserAccount, canEditData } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Users,
  Plus,
  Search,
  Phone,
  Droplet,
  Coins,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  MapPin,
} from 'lucide-react';
import { ConfirmDeleteModal, DeleteTarget } from './ConfirmDeleteModal';

interface MembersViewProps {
  members: Member[];
  settings: CommitteeSettings;
  currentUser?: UserAccount | null;
  canEdit?: boolean;
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onQuickContribute: (member: Member) => void;
  initialOpenModal?: boolean;
  onCloseInitialModal?: () => void;
}

const DESIGNATIONS: MemberDesignation[] = [
  'President',
  'General Secretary',
  'Treasurer',
  'Vice President',
  'Joint Secretary',
  'Cultural In-charge',
  'Pandal & Decoration Lead',
  'Prasad & Bhog Coordinator',
  'Executive Member',
  'Advisor',
  'Volunteer',
  'Patron / Senior Member',
];

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  settings,
  currentUser,
  canEdit: propCanEdit,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onQuickContribute,
  initialOpenModal = false,
  onCloseInitialModal,
}) => {
  const canEdit = propCanEdit ?? canEditData(currentUser?.role);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState<MemberDesignation>('Executive Member');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');

  const nextMemberCode = useMemo(() => {
    return `MEM-${String(members.length + 1).padStart(3, '0')}`;
  }, [members.length]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery) ||
        (m.address && m.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = selectedRole === 'all' || m.designation === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, selectedRole]);

  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const totalCollectedFromMembers = members.reduce(
    (sum, m) => sum + m.contributedAmount,
    0
  );

  const handleOpenAddModal = () => {
    if (!canEdit) return;
    setEditingMember(null);
    setFullName('');
    setDesignation('Executive Member');
    setPhone('');
    setAddress('');
    setBloodGroup('O+');
    setStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mem: Member) => {
    if (!canEdit) return;
    setEditingMember(mem);
    setFullName(mem.fullName);
    setDesignation(mem.designation);
    setPhone(mem.phone);
    setAddress(mem.address || '');
    setBloodGroup(mem.bloodGroup || 'O+');
    setStatus(mem.status);
    setNotes(mem.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!fullName.trim() || !phone.trim()) return;

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        fullName: fullName.trim(),
        designation,
        phone: phone.trim(),
        address: address.trim() || undefined,
        bloodGroup,
        status,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddMember({
        memberCode: nextMemberCode,
        fullName: fullName.trim(),
        designation,
        phone: phone.trim(),
        address: address.trim() || undefined,
        bloodGroup,
        contributedAmount: 0,
        status,
        joinedDate: new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
    if (onCloseInitialModal) onCloseInitialModal();
  };

  const handleDeletePrompt = (m: Member) => {
    if (!canEdit) return;
    setDeleteTarget({
      type: 'member',
      id: m.id,
      title: m.fullName,
      subtitle: m.designation,
      amount: m.contributedAmount,
      currency: settings.currency,
      reference: m.memberCode,
    });
  };

  const handleConfirmDelete = () => {
    if (!canEdit) return;
    if (deleteTarget) {
      onDeleteMember(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Committee Members Directory</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage office bearers, executive members, volunteers, and member contributions
          </p>
        </div>

        {canEdit ? (
          <button
            id="btn-add-member"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            + Add New Member
          </button>
        ) : (
          <span className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200 self-start sm:self-auto">
            🔒 View-Only Mode
          </span>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Members
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {members.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Registered organizers & volunteers</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Members
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">
            {activeMembersCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {members.length - activeMembersCount} inactive / past members
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Member Collection
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {formatCurrency(totalCollectedFromMembers, settings.currency)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
            Direct member chanda receipts
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-member-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member name, code, phone, or address..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Committee Roles</option>
            {DESIGNATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((m) => {
          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Top Row: Code & Role */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {m.memberCode}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/60">
                    {m.designation}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {m.fullName}
                </h3>

                {/* Meta details */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{m.phone}</span>
                  </div>
                  {m.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{m.address}</span>
                    </div>
                  )}
                  {m.bloodGroup && (
                    <div className="flex items-center gap-2">
                      <Droplet className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-semibold text-rose-700">Blood: {m.bloodGroup}</span>
                    </div>
                  )}
                </div>

                {/* Member Contribution */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Total Contributed:</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    {formatCurrency(m.contributedAmount, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {canEdit ? (
                  <button
                    onClick={() => onQuickContribute(m)}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    + Collect Chanda
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">View-Only</span>
                )}

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(m)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No committee members found matching your search.
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingMember ? 'Edit Member Details' : 'Add Committee Member'}
                </h3>
                <p className="text-xs text-blue-100">
                  {editingMember
                    ? `Member Code: ${editingMember.memberCode}`
                    : `Next Code: ${nextMemberCode}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseInitialModal) onCloseInitialModal();
                }}
                className="text-blue-100 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="input-member-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sri Subhas Chandra Bose"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role / Designation *
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value as MemberDesignation)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="input-member-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9830112233"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blood Group (For Puja Emergency)
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Membership Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="active">Active Committee Member</option>
                  <option value="inactive">Inactive / Past Member</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Residential Address / Workshop Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Quarter 4B, Machine Tool Colony"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Duty / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. In charge of lighting & electrical safety inspection"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-member-submit"
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingMember ? 'Save Changes' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          target={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
