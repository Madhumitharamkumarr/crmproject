/**
 * members.js — Members list page
 */

let allMembers = [];

document.addEventListener('DOMContentLoaded', () => {
  initPage('Members');
  // Set today's date as default for joined date
  document.getElementById('add-joined').value = new Date().toISOString().split('T')[0];
  loadMembers();
});

async function loadMembers() {
  try {
    allMembers = await API.get('/members');
    renderTable(allMembers);
  } catch (err) {
    document.getElementById('members-table-container').innerHTML =
      `<div class="alert alert-danger" style="margin:20px;">Failed to load members. Is the server running?</div>`;
  }
}

function renderTable(members) {
  const container = document.getElementById('members-table-container');
  if (!members.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <p>No members found. Try adjusting your filters or add a new member.</p>
      </div>`;
    return;
  }

  const rows = members.map(m => {
    const lastAct = m.lastActivityDate ? formatDate(m.lastActivityDate) : '—';
    return `
      <tr>
        <td>
          <div class="td-name">${escHtml(m.name)}</div>
          <div class="td-sub">${escHtml(m.email)}</div>
        </td>
        <td>${escHtml(m.role)}</td>
        <td>${escHtml(m.company)}</td>
        <td>${stateBadge(m.computedActivityState)}</td>
        <td>${lastAct}</td>
        <td>${escHtml(m.owner || '—')}</td>
        <td style="max-width:180px;font-size:12px;color:var(--gray-600);">${escHtml(m.nextAction || '—')}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <a href="member.html?id=${m._id}" class="btn btn-ghost btn-sm">View</a>
            <button class="btn btn-secondary btn-sm" onclick="openEditModal('${m._id}')">Edit</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="table-wrapper" style="border-radius:0;border:none;">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Company</th>
            <th>Activity State</th>
            <th>Last Activity</th>
            <th>Owner</th>
            <th>Next Action</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="padding:12px 16px;border-top:1px solid var(--gray-100);font-size:12px;color:var(--gray-400);">
      Showing ${members.length} member${members.length !== 1 ? 's' : ''} · All data is fictional demo data
    </div>`;
}

function filterMembers() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const state  = document.getElementById('filter-state').value;
  const space  = document.getElementById('filter-space').value;
  const owner  = document.getElementById('filter-owner').value;

  const filtered = allMembers.filter(m => {
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search) ||
      m.role.toLowerCase().includes(search) ||
      m.company.toLowerCase().includes(search) ||
      (m.email && m.email.toLowerCase().includes(search));

    const matchState = !state || m.computedActivityState === state;
    const matchOwner = !owner || m.owner === owner;
    const matchSpace = !space || (m.activities || []).some(a => a.space === space);

    return matchSearch && matchState && matchOwner && matchSpace;
  });

  renderTable(filtered);
}

function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-state').value = '';
  document.getElementById('filter-space').value = '';
  document.getElementById('filter-owner').value = '';
  renderTable(allMembers);
}

/* ── Add Member Modal ──────────────────────────────────────────────────────── */
function openAddModal() {
  document.getElementById('add-member-form').reset();
  document.getElementById('add-joined').value = new Date().toISOString().split('T')[0];
  document.getElementById('add-modal').style.display = 'flex';
}

function closeAddModal() {
  document.getElementById('add-modal').style.display = 'none';
}

async function submitAddMember(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('add-submit-btn');
  const name        = document.getElementById('add-name').value.trim();
  const role        = document.getElementById('add-role').value.trim();
  const company     = document.getElementById('add-company').value.trim();
  const email       = document.getElementById('add-email').value.trim();
  const joinedDate  = document.getElementById('add-joined').value;
  const owner       = document.getElementById('add-owner').value;
  const nextAction  = document.getElementById('add-next-action').value.trim();
  const notes       = document.getElementById('add-notes').value.trim();

  if (!name || !role || !company || !email || !joinedDate) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    await API.post('/members', { name, role, company, email, joinedDate, owner, nextAction, notes });
    showToast(`${name} has been added successfully.`, 'success');
    closeAddModal();
    await loadMembers();
  } catch (err) {
    showToast(err.message || 'Failed to add member.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Member';
  }
}

/* ── Edit Member Modal (inline) ────────────────────────────────────────────── */
let editingId = null;

async function openEditModal(id) {
  const member = allMembers.find(m => m._id === id);
  if (!member) return;
  editingId = id;

  // Build modal HTML dynamically
  const existing = document.getElementById('edit-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'edit-modal';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Edit Member — ${escHtml(member.name)}</h3>
        <button class="modal-close" onclick="closeEditModal()">×</button>
      </div>
      <div class="modal-body">
        <form class="form-grid" id="edit-member-form" onsubmit="submitEditMember(event)">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="edit-name" value="${escHtml(member.name)}" required />
          </div>
          <div class="form-group">
            <label>Role / Title *</label>
            <input type="text" id="edit-role" value="${escHtml(member.role)}" required />
          </div>
          <div class="form-group">
            <label>Company *</label>
            <input type="text" id="edit-company" value="${escHtml(member.company)}" required />
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" id="edit-email" value="${escHtml(member.email)}" required />
          </div>
          <div class="form-group">
            <label>Owner</label>
            <select id="edit-owner">
              <option value="Unassigned" ${member.owner === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
              <option value="Sarah Bennett" ${member.owner === 'Sarah Bennett' ? 'selected' : ''}>Sarah Bennett</option>
              <option value="Marcus Liu" ${member.owner === 'Marcus Liu' ? 'selected' : ''}>Marcus Liu</option>
            </select>
          </div>
          <div class="form-group">
            <label>Commercial Signal</label>
            <select id="edit-commercial">
              <option value="Not assessed" ${member.commercialSignal === 'Not assessed' ? 'selected' : ''}>Not assessed</option>
              <option value="Requires human review" ${member.commercialSignal === 'Requires human review' ? 'selected' : ''}>Requires human review</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label>Next Action</label>
            <input type="text" id="edit-next-action" value="${escHtml(member.nextAction || '')}" />
          </div>
          <div class="form-group full-width">
            <label>Notes</label>
            <textarea id="edit-notes" rows="3">${escHtml(member.notes || '')}</textarea>
          </div>
        </form>
        <div class="alert alert-info" style="margin-top:12px;font-size:12px;">
          Activity history is preserved. Joined date cannot be changed after creation.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
        <button class="btn btn-primary" id="edit-submit-btn" onclick="submitEditMember(event)">Save Changes</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.remove();
  editingId = null;
}

async function submitEditMember(e) {
  if (e) e.preventDefault();
  if (!editingId) return;

  const btn = document.getElementById('edit-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    const body = {
      name:           document.getElementById('edit-name').value.trim(),
      role:           document.getElementById('edit-role').value.trim(),
      company:        document.getElementById('edit-company').value.trim(),
      email:          document.getElementById('edit-email').value.trim(),
      owner:          document.getElementById('edit-owner').value,
      nextAction:     document.getElementById('edit-next-action').value.trim(),
      notes:          document.getElementById('edit-notes').value.trim(),
      commercialSignal: document.getElementById('edit-commercial').value
    };

    await API.put(`/members/${editingId}`, body);
    showToast('Member updated successfully.', 'success');
    closeEditModal();
    await loadMembers();
  } catch (err) {
    showToast(err.message || 'Failed to update member.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
  }
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
