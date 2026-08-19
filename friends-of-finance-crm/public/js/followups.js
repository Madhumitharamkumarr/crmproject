/**
 * followups.js — Follow-up page
 */

document.addEventListener('DOMContentLoaded', () => {
  initPage('Follow-ups');
  loadFollowups();
});

async function loadFollowups() {
  try {
    const members = await API.get('/followups');
    renderFollowups(members);
  } catch (err) {
    document.getElementById('followup-content').innerHTML =
      `<div class="alert alert-danger">Failed to load follow-ups. Is the server running?</div>`;
  }
}

function renderFollowups(members) {
  const container = document.getElementById('followup-content');

  if (!members.length) {
    container.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p>No members need follow-up right now.</p>
        </div>
      </div>`;
    return;
  }

  // Group by state
  const dormant    = members.filter(m => m.activityState === 'Dormant');
  const atRisk     = members.filter(m => m.activityState === 'At Risk');
  const newlyJoined= members.filter(m => m.activityState === 'Newly Joined');

  const sections = [
    { label: 'Dormant Members', icon: '🔴', members: dormant,    stateClass: 'dormant', note: 'No meaningful activity for 30+ days. Review history before any action.' },
    { label: 'At Risk Members', icon: '🟠', members: atRisk,     stateClass: 'risk',    note: 'No meaningful activity for 15–30 days. Consider appropriate check-in.' },
    { label: 'Newly Joined',    icon: '🔵', members: newlyJoined,stateClass: 'newly',   note: 'Joined within last 7 days. Welcome/onboarding action recommended.' }
  ];

  let html = '';

  sections.forEach(section => {
    if (!section.members.length) return;

    const rows = section.members.map(m => {
      const lastAct = m.lastActivityDate ? formatDate(m.lastActivityDate) : 'No activity recorded';
      return `
        <tr>
          <td>
            <div class="td-name">${escHtml(m.name)}</div>
            <div class="td-sub">${escHtml(m.role)} · ${escHtml(m.company)}</div>
          </td>
          <td>${stateBadge(m.activityState)}</td>
          <td>${lastAct}</td>
          <td>${escHtml(m.owner || '—')}</td>
          <td style="max-width:200px;font-size:12px;color:var(--gray-600);">${escHtml(m.nextAction || '—')}</td>
          <td><a href="member.html?id=${m._id}" class="btn btn-ghost btn-sm">View</a></td>
        </tr>`;
    }).join('');

    html += `
      <div class="card" style="margin-bottom:20px;padding:0;overflow:hidden;">
        <div class="focused-header ${section.stateClass}" style="padding:16px 20px;border-bottom:1px solid var(--gray-200);">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <h2 style="margin:0;">${section.icon} ${section.label}</h2>
            <span class="badge" style="background:rgba(0,0,0,.08);color:inherit;font-size:11px;">
              ${section.members.length} member${section.members.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p style="font-size:12.5px;margin-top:6px;opacity:.8;">${section.note}</p>
        </div>
        <div class="table-wrapper" style="border:none;border-radius:0;">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>State</th>
                <th>Last Activity</th>
                <th>Owner</th>
                <th>Next Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  });

  html += `<p style="font-size:12px;color:var(--gray-400);text-align:center;margin-top:12px;">
    All data shown is fictional demo data for academic purposes only.
    Total follow-ups: ${members.length}
  </p>`;

  container.innerHTML = html;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
