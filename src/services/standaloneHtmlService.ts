import { PujaManagementState, Member, IncomeRecord } from '../types';

export const standaloneHtmlService = {
  /**
   * Generates and triggers download of a 100% self-contained, single-file
   * "Bishwakarma_Puja_Management.html" desktop app.
   * Runs natively in Google Chrome, Microsoft Edge, Brave, Safari, etc.
   * with zero external server or internet connectivity required.
   */
  downloadStandaloneApp(state: PujaManagementState): void {
    // 1. Ensure Mr Biswaranjan (Phone: 9437080999) is guaranteed present in effective data
    const effectiveState: PujaManagementState = {
      ...state,
      members: [...state.members],
      incomes: [...state.incomes],
      expenses: [...state.expenses],
      users: [...state.users],
      settings: { ...state.settings },
    };

    if (
      !effectiveState.members.some(
        (m) =>
          m.phone === '9437080999' ||
          (m.fullName && m.fullName.toLowerCase().includes('biswaranjan'))
      )
    ) {
      const biswaMember: Member = {
        id: 'mem_07',
        memberCode: `MEM-${String(effectiveState.members.length + 1).padStart(3, '0')}`,
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
      effectiveState.members.push(biswaMember);

      if (
        !effectiveState.incomes.some(
          (i) =>
            i.phone === '9437080999' ||
            (i.donorName && i.donorName.toLowerCase().includes('biswaranjan'))
        )
      ) {
        effectiveState.incomes.unshift({
          id: 'inc_08',
          receiptNumber: `BK-REC-2025-${String(effectiveState.incomes.length + 1).padStart(3, '0')}`,
          date: '2025-08-29',
          donorName: 'Mr Biswaranjan',
          memberId: biswaMember.id,
          phone: '9437080999',
          address: 'Sector 4, Main Road, Committee Office',
          category: 'Member Subscription',
          amount: 11000,
          paymentMode: 'UPI / QR Code',
          transactionRef: 'UPI-9437080999-BK',
          collectedBy: effectiveState.settings.treasurerName || 'Sri Manoj Vishwakarma',
          notes: 'Bishwakarma Puja Member Chanda & Special Subscription',
          createdAt: '2025-08-29T11:00:00.000Z',
        });
      }
    }

    // Recalculate member contributions to ensure accuracy
    const memberContributionSums = new Map<string, number>();
    effectiveState.incomes.forEach((i) => {
      if (i.memberId) {
        const current = memberContributionSums.get(i.memberId) || 0;
        memberContributionSums.set(i.memberId, current + Number(i.amount || 0));
      }
    });

    effectiveState.members = effectiveState.members.map((m) => {
      if (memberContributionSums.has(m.id)) {
        return { ...m, contributedAmount: memberContributionSums.get(m.id)! };
      }
      return m;
    });

    const totalIncome = effectiveState.incomes.reduce(
      (sum, i) => sum + Number(i.amount || 0),
      0
    );
    const totalExpense = effectiveState.expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );
    const netBalance = totalIncome - totalExpense;
    const targetBudget = Number(effectiveState.settings.targetBudget || 0);
    const budgetPct = targetBudget > 0 ? Math.round((totalExpense / targetBudget) * 100) : 0;
    const cur = effectiveState.settings.currency || '₹';

    const serializedData = JSON.stringify(effectiveState).replace(/</g, '\\u003c');
    const exportTimestamp = Date.now();

    // 2. Pre-rendered HTML content for instant offline viewing and raw text search (Notepad, Ctrl+F)
    const preRenderedMembersRows = effectiveState.members
      .map(
        (m) => `
          <tr>
            <td><strong>${m.memberCode}</strong></td>
            <td><strong>${m.fullName}</strong></td>
            <td><span class="tag tag-upi">${m.designation}</span></td>
            <td><strong>${m.phone}</strong></td>
            <td style="color:#16a34a; font-weight:600;">${cur}${Number(m.contributedAmount || 0).toLocaleString('en-IN')}</td>
          </tr>
        `
      )
      .join('');

    const preRenderedIncomeRows = effectiveState.incomes
      .map(
        (i) => `
          <tr>
            <td><strong>${i.receiptNumber}</strong></td>
            <td>${i.date}</td>
            <td><strong>${i.donorName}</strong></td>
            <td><strong>${i.phone || '-'}</strong></td>
            <td>${i.category}</td>
            <td><span class="tag tag-upi">${i.paymentMode}</span></td>
            <td style="font-weight:700; color:#16a34a;">${cur}${Number(i.amount || 0).toLocaleString('en-IN')}</td>
            <td>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; color:#b45309;" onclick="viewReceiptPrint('${i.id}')">Receipt</button>
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; color:#dc2626;" onclick="deleteIncomeRecord('${i.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `
      )
      .join('');

    const preRenderedExpenseRows = effectiveState.expenses
      .map(
        (e) => `
          <tr>
            <td><strong>${e.voucherNumber}</strong></td>
            <td>${e.date}</td>
            <td><strong>${e.payeeName}</strong></td>
            <td>${e.category}</td>
            <td><span class="tag tag-cash">${e.paymentMode}</span></td>
            <td style="font-weight:700; color:#dc2626;">${cur}${Number(e.amount || 0).toLocaleString('en-IN')}</td>
            <td>${e.authorizedBy || '-'}</td>
            <td>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; color:#dc2626;" onclick="deleteExpenseRecord('${e.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `
      )
      .join('');

    const combinedRecent = [
      ...effectiveState.incomes.map((i) => ({
        type: 'Income',
        ...i,
        ref: i.receiptNumber,
        party: i.donorName,
      })),
      ...effectiveState.expenses.map((e) => ({
        type: 'Expense',
        ...e,
        ref: e.voucherNumber,
        party: e.payeeName,
      })),
    ]
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 8);

    const preRenderedRecentRows = combinedRecent
      .map(
        (item) => `
        <tr>
          <td><span class="tag ${item.type === 'Income' ? 'tag-cash' : 'tag-bank'}">${item.type}</span></td>
          <td><strong>${item.ref}</strong></td>
          <td>${item.date}</td>
          <td><strong>${item.party}</strong></td>
          <td>${item.category}</td>
          <td>${item.paymentMode}</td>
          <td style="font-weight:700; color:${item.type === 'Income' ? '#16a34a' : '#dc2626'}">
            ${item.type === 'Income' ? '+' : '-'}${cur}${Number(item.amount || 0).toLocaleString('en-IN')}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${effectiveState.settings.committeeName} — Offline Desktop Management</title>
  <style>
    :root {
      --primary: #d97706;
      --primary-dark: #b45309;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --success: #16a34a;
      --danger: #dc2626;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: var(--bg); color: var(--text); line-height: 1.5; padding-bottom: 40px; }
    header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 16px 24px; border-bottom: 3px solid #f59e0b; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .header-title h1 { font-size: 20px; font-weight: 700; color: #fbbf24; }
    .header-title p { font-size: 12px; color: #94a3b8; }
    .badge-offline { background: #065f46; color: #34d399; font-size: 11px; padding: 4px 8px; border-radius: 9999px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
    .nav-tabs { display: flex; gap: 8px; background: #0f172a; padding: 6px 24px; border-bottom: 1px solid #334155; overflow-x: auto; }
    .nav-tab { background: transparent; border: none; color: #94a3b8; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .nav-tab.active { background: #d97706; color: #ffffff; }
    .nav-tab:hover:not(.active) { background: #1e293b; color: #e2e8f0; }
    .container { max-width: 1280px; margin: 24px auto; padding: 0 16px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: var(--card-bg); padding: 18px; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .stat-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 24px; font-weight: 700; color: var(--text); margin-top: 6px; }
    .stat-sub { font-size: 12px; margin-top: 4px; color: var(--text-muted); }
    .btn { background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .btn:hover { background: var(--primary-dark); }
    .btn-secondary { background: #475569; }
    .btn-secondary:hover { background: #334155; }
    .btn-warning { background: #f59e0b; color: #0f172a; font-weight: 700; }
    .btn-warning:hover { background: #d97706; color: white; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: #f1f5f9; }
    .card { background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); padding: 20px; margin-bottom: 24px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .card-title { font-size: 16px; font-weight: 700; color: var(--text); }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background: #f1f5f9; padding: 10px 12px; color: #475569; font-weight: 600; border-bottom: 1px solid var(--border); }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:hover td { background: #f8fafc; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .tag-cash { background: #dcfce7; color: #166534; }
    .tag-upi { background: #e0e7ff; color: #3730a3; }
    .tag-bank { background: #fef3c7; color: #92400e; }
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; justify-content: center; align-items: center; padding: 16px; }
    .modal { background: white; border-radius: 12px; width: 100%; max-width: 550px; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #334155; }
    .form-control { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
    .banner-notify { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 10px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    @media print {
      body { background: white !important; padding: 0 !important; margin: 0 !important; }
      header, nav, main, .no-print, .modal-overlay:not(#modal-receipt-print) { display: none !important; }
      #modal-receipt-print { display: block !important; position: static !important; background: transparent !important; padding: 0 !important; }
      #modal-receipt-print .modal { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
      #printable-receipt { display: block !important; width: 100% !important; max-width: 720px !important; margin: 0 auto !important; border: 2px solid #b45309 !important; background: white !important; }
      @page { size: A4 portrait; margin: 10mm 15mm; }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-title">
      <h1 id="hdr-comm-name">${effectiveState.settings.committeeName}</h1>
      <p id="hdr-puja-meta">Bishwakarma Puja Edition ${effectiveState.settings.pujaYear} &bull; ${effectiveState.settings.venue}</p>
    </div>
    <div style="display:flex; align-items:center; gap: 8px; flex-wrap: wrap;">
      <span class="badge-offline">Offline Desktop App</span>
      <button class="btn btn-warning" onclick="downloadUpdatedHtml()" title="Save changes directly into an updated Bishwakarma_Puja_Management.html file">Save Updated HTML</button>
      <button class="btn btn-outline" style="color:white; border-color:#64748b;" onclick="resetToEmbeddedData()" title="Reset data back to the original content embedded inside this HTML file">Reset to File Data</button>
      <button class="btn btn-outline" style="color:white; border-color:#64748b;" onclick="saveAndBackupLocal()">Backup JSON</button>
    </div>
  </header>

  <nav class="nav-tabs">
    <button class="nav-tab active" onclick="switchTab('dashboard')">Dashboard & KPIs</button>
    <button class="nav-tab" onclick="switchTab('income')">Income & Chanda</button>
    <button class="nav-tab" onclick="switchTab('expense')">Expenses & Vouchers</button>
    <button class="nav-tab" onclick="switchTab('members')">Committee Members</button>
    <button class="nav-tab" onclick="switchTab('settings')">Committee Settings</button>
  </nav>

  <main class="container">
    <!-- DASHBOARD VIEW -->
    <div id="view-dashboard">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Collection (Income)</div>
          <div class="stat-value" id="kpi-total-income" style="color:#16a34a;">${cur}${totalIncome.toLocaleString('en-IN')}</div>
          <div class="stat-sub" id="kpi-income-count">${effectiveState.incomes.length} donations logged</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Expenditure</div>
          <div class="stat-value" id="kpi-total-expense" style="color:#dc2626;">${cur}${totalExpense.toLocaleString('en-IN')}</div>
          <div class="stat-sub" id="kpi-expense-count">${effectiveState.expenses.length} vouchers logged</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Net Balance Available</div>
          <div class="stat-value" id="kpi-net-balance">${cur}${netBalance.toLocaleString('en-IN')}</div>
          <div class="stat-sub" id="kpi-balance-sub">Cash in Hand + Bank</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Target Budget</div>
          <div class="stat-value" id="kpi-target-budget">${cur}${targetBudget.toLocaleString('en-IN')}</div>
          <div class="stat-sub" id="kpi-budget-progress">${budgetPct}% of budget utilized</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Recent Financial Transactions</div>
          <div>
            <button class="btn" onclick="openIncomeModal()">+ Add Income / Chanda</button>
            <button class="btn btn-secondary" onclick="openExpenseModal()">+ Add Expense</button>
          </div>
        </div>
        <table id="table-recent">
          <thead>
            <tr>
              <th>Type</th>
              <th>Voucher / Receipt</th>
              <th>Date</th>
              <th>Party / Donor Name</th>
              <th>Category</th>
              <th>Payment Mode</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody id="tbody-recent">
            ${preRenderedRecentRows || '<tr><td colspan="7" style="text-align:center; padding:20px; color:#94a3b8;">No records logged yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- INCOME VIEW -->
    <div id="view-income" style="display:none;">
      <div class="card">
        <div class="card-header">
          <div class="card-title">All Income & Donations (Chanda Register)</div>
          <div style="display:flex; gap: 8px;">
            <input type="text" id="filter-income-search" class="form-control" style="width:240px;" placeholder="Search donor, phone, receipt..." oninput="renderIncomeTable()">
            <button class="btn" onclick="openIncomeModal()">+ Record New Income</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Date</th>
              <th>Donor Name</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Payment Mode</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="tbody-income">
            ${preRenderedIncomeRows || '<tr><td colspan="8" style="text-align:center; padding:20px;">No income records found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- EXPENSE VIEW -->
    <div id="view-expense" style="display:none;">
      <div class="card">
        <div class="card-header">
          <div class="card-title">All Expenses & Payment Vouchers</div>
          <div style="display:flex; gap: 8px;">
            <input type="text" id="filter-expense-search" class="form-control" style="width:240px;" placeholder="Search payee / voucher..." oninput="renderExpenseTable()">
            <button class="btn" onclick="openExpenseModal()">+ Record New Expense</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Voucher No</th>
              <th>Date</th>
              <th>Payee / Vendor</th>
              <th>Category</th>
              <th>Payment Mode</th>
              <th>Amount</th>
              <th>Authorized By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="tbody-expense">
            ${preRenderedExpenseRows || '<tr><td colspan="8" style="text-align:center; padding:20px;">No expense records found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- MEMBERS VIEW -->
    <div id="view-members" style="display:none;">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Committee Members Directory</div>
          <div style="display:flex; gap:8px;">
            <input type="text" id="filter-members-search" class="form-control" style="width:260px;" placeholder="Search member by name, phone (9437080999)..." oninput="renderMembersTable()">
            <button class="btn" onclick="openMemberModal()">+ Add Member</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Full Name</th>
              <th>Role / Designation</th>
              <th>Phone</th>
              <th>Total Contributed</th>
            </tr>
          </thead>
          <tbody id="tbody-members">
            ${preRenderedMembersRows || '<tr><td colspan="5" style="text-align:center; padding:20px;">No members added.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- SETTINGS VIEW -->
    <div id="view-settings" style="display:none;">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">Committee Configuration Settings</div>
        <form onsubmit="handleSaveSettings(event)">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
            <div class="form-group">
              <label>Committee Name</label>
              <input type="text" id="cfg-name" class="form-control" value="${effectiveState.settings.committeeName}" required>
            </div>
            <div class="form-group">
              <label>Puja Year / Session</label>
              <input type="text" id="cfg-year" class="form-control" value="${effectiveState.settings.pujaYear}" required>
            </div>
            <div class="form-group">
              <label>Venue / Location</label>
              <input type="text" id="cfg-venue" class="form-control" value="${effectiveState.settings.venue}" required>
            </div>
            <div class="form-group">
              <label>Target Budget (${cur})</label>
              <input type="number" id="cfg-budget" class="form-control" value="${effectiveState.settings.targetBudget}" required>
            </div>
            <div class="form-group">
              <label>President Name</label>
              <input type="text" id="cfg-president" class="form-control" value="${effectiveState.settings.presidentName || ''}">
            </div>
            <div class="form-group">
              <label>Secretary Name</label>
              <input type="text" id="cfg-secretary" class="form-control" value="${effectiveState.settings.secretaryName || ''}">
            </div>
            <div class="form-group">
              <label>Treasurer / Cashier Name</label>
              <input type="text" id="cfg-treasurer" class="form-control" value="${effectiveState.settings.treasurerName || ''}">
            </div>
            <div class="form-group">
              <label>Contact Phone</label>
              <input type="text" id="cfg-phone" class="form-control" value="${effectiveState.settings.contactPhone || '9437080999'}">
            </div>
          </div>
          <div style="margin-top:16px;">
            <button type="submit" class="btn">Save Committee Settings</button>
          </div>
        </form>
      </div>
    </div>
  </main>

  <!-- MODALS -->
  <div id="modal-income" class="modal-overlay">
    <div class="modal">
      <h3 style="margin-bottom:16px;">Record Income / Chanda Receipt</h3>
      <form onsubmit="handleSaveIncome(event)">
        <div class="form-group">
          <label>Donor / Contributor Name *</label>
          <input type="text" id="inc-donor" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="inc-category" class="form-control">
            <option>Chanda / General Donation</option>
            <option>Member Subscription</option>
            <option>Idol / Murti Sponsor</option>
            <option>Sound & Light Sponsor</option>
            <option>Bhog & Prasad Sponsor</option>
            <option>VIP / Corporate Sponsor</option>
            <option>Miscellaneous</option>
          </select>
        </div>
        <div class="form-group">
          <label>Amount (${cur}) *</label>
          <input type="number" id="inc-amount" class="form-control" min="1" required>
        </div>
        <div class="form-group">
          <label>Payment Mode</label>
          <select id="inc-mode" class="form-control">
            <option>Cash</option>
            <option>UPI / QR Code</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
          </select>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="text" id="inc-phone" class="form-control">
        </div>
        <div class="form-group">
          <label>Remarks / Notes</label>
          <input type="text" id="inc-notes" class="form-control">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button type="button" class="btn btn-outline" onclick="closeModal('modal-income')">Cancel</button>
          <button type="submit" class="btn">Save Receipt</button>
        </div>
      </form>
    </div>
  </div>

  <div id="modal-expense" class="modal-overlay">
    <div class="modal">
      <h3 style="margin-bottom:16px;">Record Payment Voucher (Expense)</h3>
      <form onsubmit="handleSaveExpense(event)">
        <div class="form-group">
          <label>Payee / Vendor Name *</label>
          <input type="text" id="exp-payee" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Expense Category</label>
          <select id="exp-category" class="form-control">
            <option>Idol / Murti & Transport</option>
            <option>Priest & Purohit Dakshina</option>
            <option>Tent, Pandal & Mandap Decor</option>
            <option>Sound System & DJ / Lighting</option>
            <option>Flowers & Puja Samagri</option>
            <option>Bhog, Prasad & Sweets</option>
            <option>Cultural Events & Artists</option>
            <option>Banner, Memento & Printing</option>
            <option>Miscellaneous</option>
          </select>
        </div>
        <div class="form-group">
          <label>Amount (${cur}) *</label>
          <input type="number" id="exp-amount" class="form-control" min="1" required>
        </div>
        <div class="form-group">
          <label>Payment Mode</label>
          <select id="exp-mode" class="form-control">
            <option>Cash</option>
            <option>UPI / QR Code</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
          </select>
        </div>
        <div class="form-group">
          <label>Authorized By</label>
          <input type="text" id="exp-auth" class="form-control" value="${effectiveState.settings.presidentName || ''}">
        </div>
        <div class="form-group">
          <label>Remarks</label>
          <input type="text" id="exp-notes" class="form-control">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button type="button" class="btn btn-outline" onclick="closeModal('modal-expense')">Cancel</button>
          <button type="submit" class="btn">Save Voucher</button>
        </div>
      </form>
    </div>
  </div>

  <div id="modal-member" class="modal-overlay">
    <div class="modal">
      <h3 style="margin-bottom:16px;">Add Committee Member</h3>
      <form onsubmit="handleSaveMember(event)">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="mem-name" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Designation / Role</label>
          <select id="mem-role" class="form-control">
            <option>Executive Member</option>
            <option>Executive Committee Member & Key Patron</option>
            <option>Volunteer</option>
            <option>Vice President</option>
            <option>Joint Secretary</option>
            <option>Cultural In-charge</option>
            <option>Pandal & Decoration Lead</option>
            <option>Prasad & Bhog Coordinator</option>
            <option>Patron / Senior Member</option>
          </select>
        </div>
        <div class="form-group">
          <label>Phone Number *</label>
          <input type="text" id="mem-phone" class="form-control" required>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button type="button" class="btn btn-outline" onclick="closeModal('modal-member')">Cancel</button>
          <button type="submit" class="btn">Add Member</button>
        </div>
      </form>
    </div>
  </div>

  <div id="modal-receipt-print" class="modal-overlay">
    <div class="modal" style="max-width: 680px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;" class="no-print">
        <h3 style="font-size:15px; font-weight:bold; color:#0f172a;">Print Donation Receipt</h3>
        <div style="display:flex; gap:8px;">
          <button class="btn" onclick="window.print()">Print Receipt</button>
          <button class="btn btn-outline" onclick="closeModal('modal-receipt-print')">Close</button>
        </div>
      </div>
      <div id="printable-receipt" style="border: 3px double #b45309; border-radius: 10px; padding: 24px; background: #fffdfa;">
        <div style="text-align: center; border-bottom: 2px solid #fde68a; padding-bottom: 12px; margin-bottom: 14px;">
          <div style="font-size: 11px; color: #b45309; font-weight: 700; letter-spacing: 1px;">|| जय श्री विश्वकर्मा || ॐ विश्वकर्मणे नमः ||</div>
          <h2 id="prn-comm" style="font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 4px 0;"></h2>
          <p id="prn-venue" style="font-size: 12px; color: #475569;"></p>
          <div style="display: inline-block; margin-top: 8px; background: #f59e0b; color: #0f172a; font-size: 11px; font-weight: 800; padding: 3px 12px; border-radius: 9999px;">OFFICIAL CHANDA RECEIPT</div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; padding-bottom: 8px; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1;">
          <div>Receipt No: <strong id="prn-no" style="font-family:monospace; font-size:13px;"></strong></div>
          <div>Date: <strong id="prn-date"></strong></div>
        </div>
        <div style="font-size: 13px; line-height: 2;">
          <div>Received with thanks from: <strong id="prn-donor" style="font-size: 15px; border-bottom: 1px dotted #64748b; padding-bottom: 2px; min-width: 220px; display: inline-block;"></strong></div>
          <div>On Account of: <strong id="prn-category"></strong></div>
          <div>Payment Mode: <strong id="prn-mode"></strong></div>
        </div>
        <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px;">
          <span style="font-size: 12px; font-weight: 700; color: #78350f;">AMOUNT RECEIVED:</span>
          <span id="prn-amount" style="font-size: 22px; font-weight: 900; color: #78350f; font-family: monospace;"></span>
        </div>
        <div style="margin-top: 32px; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 11px; color: #64748b;">
          <div>
            <div style="height: 25px;"></div>
            <div id="prn-collector" style="border-top: 1px solid #64748b; font-weight: 600; color: #1e293b; padding-top: 2px; width: 160px;"></div>
            <div>Authorized Collector</div>
          </div>
          <div>
            <div style="height: 25px;"></div>
            <div id="prn-treasurer" style="border-top: 1px solid #64748b; font-weight: 600; color: #1e293b; padding-top: 2px; width: 160px;"></div>
            <div>Treasurer / Secretary</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Embedded Data Stamped on Save/Export
    const EMBEDDED_VERSION = ${exportTimestamp};
    const STORAGE_KEY = 'BISHWAKARMA_PUJA_OFFLINE_APP_STATE';
    const STORAGE_VERSION_KEY = 'BISHWAKARMA_PUJA_OFFLINE_APP_VERSION';
    
    const embeddedData = ${serializedData};
    let appState = embeddedData;

    try {
      const storedVersion = Number(localStorage.getItem(STORAGE_VERSION_KEY) || '0');
      const stored = localStorage.getItem(STORAGE_KEY);
      
      // If this file is freshly exported (EMBEDDED_VERSION >= storedVersion),
      // or if no stored data exists, ALWAYS prioritize the data embedded in this file!
      if (!stored || EMBEDDED_VERSION >= storedVersion) {
        appState = embeddedData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
        localStorage.setItem(STORAGE_VERSION_KEY, String(EMBEDDED_VERSION));
      } else {
        // Only load stored if user made newer offline modifications in this browser
        const parsed = JSON.parse(stored);
        // Ensure Mr Biswaranjan (9437080999) is never dropped
        if (embeddedData.members && !parsed.members.some(m => m.phone === '9437080999' || (m.fullName && m.fullName.toLowerCase().includes('biswaranjan')))) {
          const biswa = embeddedData.members.find(m => m.phone === '9437080999' || (m.fullName && m.fullName.toLowerCase().includes('biswaranjan')));
          if (biswa) parsed.members.push(biswa);
        }
        appState = parsed;
      }
    } catch(e) {
      console.warn('Storage read fallback', e);
      appState = embeddedData;
    }

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
        localStorage.setItem(STORAGE_VERSION_KEY, String(Date.now()));
      } catch(e) {
        console.error('Save failed', e);
      }
      renderDashboard();
    }

    function formatCur(val) {
      return (appState.settings.currency || '₹') + Number(val || 0).toLocaleString('en-IN');
    }

    function switchTab(tabId) {
      ['dashboard', 'income', 'expense', 'members', 'settings'].forEach(t => {
        const el = document.getElementById('view-' + t);
        if (el) el.style.display = (t === tabId) ? 'block' : 'none';
      });
      document.querySelectorAll('.nav-tab').forEach((b, idx) => {
        const tabs = ['dashboard', 'income', 'expense', 'members', 'settings'];
        if (tabs[idx] === tabId) b.classList.add('active');
        else b.classList.remove('active');
      });

      if (tabId === 'dashboard') renderDashboard();
      if (tabId === 'income') renderIncomeTable();
      if (tabId === 'expense') renderExpenseTable();
      if (tabId === 'members') renderMembersTable();
      if (tabId === 'settings') populateSettingsForm();
    }

    function renderDashboard() {
      const totalInc = (appState.incomes || []).reduce((s, i) => s + Number(i.amount || 0), 0);
      const totalExp = (appState.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
      const net = totalInc - totalExp;
      const budget = Number(appState.settings.targetBudget || 0);

      document.getElementById('kpi-total-income').innerText = formatCur(totalInc);
      document.getElementById('kpi-income-count').innerText = (appState.incomes || []).length + ' collections';
      document.getElementById('kpi-total-expense').innerText = formatCur(totalExp);
      document.getElementById('kpi-expense-count').innerText = (appState.expenses || []).length + ' vouchers';
      document.getElementById('kpi-net-balance').innerText = formatCur(net);
      document.getElementById('kpi-target-budget').innerText = formatCur(budget);
      const pct = budget > 0 ? Math.round((totalExp / budget) * 100) : 0;
      document.getElementById('kpi-budget-progress').innerText = pct + '% of budget utilized';

      const tbodyRecent = document.getElementById('tbody-recent');
      if (tbodyRecent) {
        const combined = [
          ...(appState.incomes || []).map(i => ({ type: 'Income', ...i, ref: i.receiptNumber, party: i.donorName })),
          ...(appState.expenses || []).map(e => ({ type: 'Expense', ...e, ref: e.voucherNumber, party: e.payeeName }))
        ].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()).slice(0, 8);

        tbodyRecent.innerHTML = combined.map(item => \`
          <tr>
            <td><span class="tag \${item.type === 'Income' ? 'tag-cash' : 'tag-bank'}">\${item.type}</span></td>
            <td><strong>\${item.ref}</strong></td>
            <td>\${item.date}</td>
            <td><strong>\${item.party}</strong></td>
            <td>\${item.category}</td>
            <td>\${item.paymentMode}</td>
            <td style="font-weight:700; color:\${item.type === 'Income' ? '#16a34a' : '#dc2626'}">
              \${item.type === 'Income' ? '+' : '-'}\${formatCur(item.amount)}
            </td>
          </tr>
        \`).join('') || '<tr><td colspan="7" style="text-align:center; padding:20px; color:#94a3b8;">No records logged yet.</td></tr>';
      }
    }

    function viewReceiptPrint(id) {
      const inc = (appState.incomes || []).find(i => i.id === id);
      if (!inc) return;
      document.getElementById('prn-comm').innerText = appState.settings.committeeName || 'Bishwakarma Puja Committee';
      document.getElementById('prn-venue').innerText = (appState.settings.venue || '') + ' • ' + (appState.settings.city || '');
      document.getElementById('prn-no').innerText = inc.receiptNumber;
      document.getElementById('prn-date').innerText = inc.date;
      document.getElementById('prn-donor').innerText = inc.donorName;
      document.getElementById('prn-category').innerText = inc.category;
      document.getElementById('prn-mode').innerText = inc.paymentMode + (inc.transactionRef ? ' (' + inc.transactionRef + ')' : '');
      document.getElementById('prn-amount').innerText = formatCur(inc.amount);
      document.getElementById('prn-collector').innerText = inc.collectedBy || 'Collector';
      document.getElementById('prn-treasurer').innerText = appState.settings.treasurerName || 'Treasurer';
      openModal('modal-receipt-print');
    }

    function deleteIncomeRecord(id) {
      const inc = (appState.incomes || []).find(i => i.id === id);
      if (!inc) return;
      if (confirm('Permanently delete receipt ' + inc.receiptNumber + ' (' + inc.donorName + ' - ' + formatCur(inc.amount) + ')?')) {
        if (inc.memberId) {
          appState.members = (appState.members || []).map(m =>
            m.id === inc.memberId
              ? { ...m, contributedAmount: Math.max(0, (m.contributedAmount || 0) - inc.amount) }
              : m
          );
        }
        appState.incomes = appState.incomes.filter(i => i.id !== id);
        saveState();
        renderIncomeTable();
      }
    }

    function deleteExpenseRecord(id) {
      const exp = (appState.expenses || []).find(e => e.id === id);
      if (!exp) return;
      if (confirm('Permanently delete payment voucher ' + exp.voucherNumber + ' (' + exp.payeeName + ' - ' + formatCur(exp.amount) + ')?')) {
        appState.expenses = appState.expenses.filter(e => e.id !== id);
        saveState();
        renderExpenseTable();
      }
    }

    function renderIncomeTable() {
      const q = (document.getElementById('filter-income-search')?.value || '').toLowerCase();
      const list = (appState.incomes || []).filter(i => 
        (i.donorName || '').toLowerCase().includes(q) ||
        (i.receiptNumber || '').toLowerCase().includes(q) ||
        (i.phone || '').includes(q)
      );
      const tbody = document.getElementById('tbody-income');
      tbody.innerHTML = list.map(i => \`
        <tr>
          <td><strong>\${i.receiptNumber}</strong></td>
          <td>\${i.date}</td>
          <td><strong>\${i.donorName}</strong></td>
          <td><strong>\${i.phone || '-'}</strong></td>
          <td>\${i.category}</td>
          <td><span class="tag tag-upi">\${i.paymentMode}</span></td>
          <td style="font-weight:700; color:#16a34a;">\${formatCur(i.amount)}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; color:#b45309;" onclick="viewReceiptPrint('\${i.id}')">Receipt</button>
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; color:#dc2626;" onclick="deleteIncomeRecord('\${i.id}')">Delete</button>
            </div>
          </td>
        </tr>
      \`).join('') || '<tr><td colspan="8" style="text-align:center; padding:20px;">No income records found.</td></tr>';
    }

    function renderExpenseTable() {
      const q = (document.getElementById('filter-expense-search')?.value || '').toLowerCase();
      const list = (appState.expenses || []).filter(e => 
        (e.payeeName || '').toLowerCase().includes(q) || (e.voucherNumber || '').toLowerCase().includes(q)
      );
      const tbody = document.getElementById('tbody-expense');
      tbody.innerHTML = list.map(e => \`
        <tr>
          <td><strong>\${e.voucherNumber}</strong></td>
          <td>\${e.date}</td>
          <td><strong>\${e.payeeName}</strong></td>
          <td>\${e.category}</td>
          <td><span class="tag tag-cash">\${e.paymentMode}</span></td>
          <td style="font-weight:700; color:#dc2626;">\${formatCur(e.amount)}</td>
          <td>\${e.authorizedBy || '-'}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; color:#dc2626;" onclick="deleteExpenseRecord('\${e.id}')">Delete</button>
            </div>
          </td>
        </tr>
      \`).join('') || '<tr><td colspan="8" style="text-align:center; padding:20px;">No expense records found.</td></tr>';
    }

    function renderMembersTable() {
      const q = (document.getElementById('filter-members-search')?.value || '').toLowerCase();
      const list = (appState.members || []).filter(m => 
        (m.fullName || '').toLowerCase().includes(q) ||
        (m.memberCode || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q) ||
        (m.designation || '').toLowerCase().includes(q)
      );
      const tbody = document.getElementById('tbody-members');
      tbody.innerHTML = list.map(m => {
        return \`
          <tr>
            <td><strong>\${m.memberCode}</strong></td>
            <td><strong>\${m.fullName}</strong></td>
            <td><span class="tag tag-upi">\${m.designation}</span></td>
            <td><strong>\${m.phone}</strong></td>
            <td style="color:#16a34a; font-weight:600;">\${formatCur(m.contributedAmount)}</td>
          </tr>
        \`;
      }).join('') || '<tr><td colspan="5" style="text-align:center; padding:20px;">No matching members found.</td></tr>';
    }

    function populateSettingsForm() {
      document.getElementById('cfg-name').value = appState.settings.committeeName || '';
      document.getElementById('cfg-year').value = appState.settings.pujaYear || '';
      document.getElementById('cfg-venue').value = appState.settings.venue || '';
      document.getElementById('cfg-budget').value = appState.settings.targetBudget || 0;
      document.getElementById('cfg-president').value = appState.settings.presidentName || '';
      document.getElementById('cfg-secretary').value = appState.settings.secretaryName || '';
      document.getElementById('cfg-treasurer').value = appState.settings.treasurerName || '';
      document.getElementById('cfg-phone').value = appState.settings.contactPhone || '9437080999';
    }

    function handleSaveSettings(e) {
      e.preventDefault();
      appState.settings.committeeName = document.getElementById('cfg-name').value;
      appState.settings.pujaYear = document.getElementById('cfg-year').value;
      appState.settings.venue = document.getElementById('cfg-venue').value;
      appState.settings.targetBudget = Number(document.getElementById('cfg-budget').value);
      appState.settings.presidentName = document.getElementById('cfg-president').value;
      appState.settings.secretaryName = document.getElementById('cfg-secretary').value;
      appState.settings.treasurerName = document.getElementById('cfg-treasurer').value;
      appState.settings.contactPhone = document.getElementById('cfg-phone').value;
      
      document.getElementById('hdr-comm-name').innerText = appState.settings.committeeName;
      document.getElementById('hdr-puja-meta').innerText = 'Bishwakarma Puja Edition ' + appState.settings.pujaYear + ' • ' + appState.settings.venue;

      saveState();
      alert('Committee settings updated and saved locally!');
      switchTab('dashboard');
    }

    function openModal(id) { document.getElementById(id).style.display = 'flex'; }
    function openIncomeModal() { openModal('modal-income'); }
    function openExpenseModal() { openModal('modal-expense'); }
    function openMemberModal() { openModal('modal-member'); }
    function closeModal(id) { document.getElementById(id).style.display = 'none'; }

    function handleSaveIncome(e) {
      e.preventDefault();
      const num = (appState.incomes || []).length + 1;
      const rec = {
        id: 'inc_' + Date.now(),
        receiptNumber: (appState.settings.receiptPrefix || 'BK-REC') + '-' + new Date().getFullYear() + '-' + String(num).padStart(3, '0'),
        date: new Date().toISOString().split('T')[0],
        donorName: document.getElementById('inc-donor').value,
        category: document.getElementById('inc-category').value,
        amount: Number(document.getElementById('inc-amount').value),
        paymentMode: document.getElementById('inc-mode').value,
        phone: document.getElementById('inc-phone').value,
        notes: document.getElementById('inc-notes').value,
        collectedBy: appState.settings.treasurerName || 'Treasurer',
        createdAt: new Date().toISOString()
      };
      appState.incomes.unshift(rec);
      saveState();
      closeModal('modal-income');
      e.target.reset();
      alert('Receipt ' + rec.receiptNumber + ' created successfully for ' + formatCur(rec.amount));
      if (document.getElementById('view-income').style.display === 'block') renderIncomeTable();
    }

    function handleSaveExpense(e) {
      e.preventDefault();
      const num = (appState.expenses || []).length + 1;
      const exp = {
        id: 'exp_' + Date.now(),
        voucherNumber: (appState.settings.expensePrefix || 'BK-EXP') + '-' + new Date().getFullYear() + '-' + String(num).padStart(3, '0'),
        date: new Date().toISOString().split('T')[0],
        payeeName: document.getElementById('exp-payee').value,
        category: document.getElementById('exp-category').value,
        amount: Number(document.getElementById('exp-amount').value),
        paymentMode: document.getElementById('exp-mode').value,
        authorizedBy: document.getElementById('exp-auth').value,
        paidBy: appState.settings.treasurerName || 'Treasurer',
        notes: document.getElementById('exp-notes').value,
        createdAt: new Date().toISOString()
      };
      appState.expenses.unshift(exp);
      saveState();
      closeModal('modal-expense');
      e.target.reset();
      alert('Voucher ' + exp.voucherNumber + ' recorded for ' + formatCur(exp.amount));
      if (document.getElementById('view-expense').style.display === 'block') renderExpenseTable();
    }

    function handleSaveMember(e) {
      e.preventDefault();
      const num = (appState.members || []).length + 1;
      const mem = {
        id: 'mem_' + Date.now(),
        memberCode: 'MEM-' + String(num).padStart(3, '0'),
        fullName: document.getElementById('mem-name').value,
        designation: document.getElementById('mem-role').value,
        phone: document.getElementById('mem-phone').value,
        pledgeAmount: 0,
        contributedAmount: 0,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      appState.members.push(mem);
      saveState();
      closeModal('modal-member');
      e.target.reset();
      alert('Member ' + mem.fullName + ' registered with code ' + mem.memberCode);
      if (document.getElementById('view-members').style.display === 'block') renderMembersTable();
    }

    function downloadUpdatedHtml() {
      saveState();
      const serialized = JSON.stringify(appState).replace(/</g, '\\u003c');
      let currentDoc = document.documentElement.outerHTML;
      
      // Update the embedded JSON state and export timestamp
      currentDoc = currentDoc.replace(/const embeddedData = [^;]+;/, 'const embeddedData = ' + serialized + ';');
      currentDoc = currentDoc.replace(/const EMBEDDED_VERSION = \\d+;/, 'const EMBEDDED_VERSION = ' + Date.now() + ';');
      
      const fullHtml = '<!DOCTYPE html>\\n<html lang="en">' + currentDoc.substring(currentDoc.indexOf('>') + 1);
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Bishwakarma_Puja_Management.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alert('Saved updated Bishwakarma_Puja_Management.html! Double click to open in Chrome or Edge.');
    }

    function resetToEmbeddedData() {
      if (confirm('Reset all offline records back to the initial data inside this HTML file?')) {
        appState = JSON.parse(JSON.stringify(embeddedData));
        saveState();
        location.reload();
      }
    }

    function saveAndBackupLocal() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", "Bishwakarma_Puja_Backup_" + new Date().toISOString().split('T')[0] + ".json");
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    // Initialize display on load
    window.addEventListener('DOMContentLoaded', () => {
      renderDashboard();
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Exactly as requested: "Save as Bishwakarma_Puja_Management.html"
    link.download = 'Bishwakarma_Puja_Management.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
