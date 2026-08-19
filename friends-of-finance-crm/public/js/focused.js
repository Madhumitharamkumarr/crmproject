/**
 * focused.js — Focused views for Newly Joined / Highly Active / At Risk / Dormant
 */

const STATE_CONFIG = {
  'newly-joined': {
    label: 'New Members',
    title: '🔵 Newly Joined Members',
    className: 'newly',
    description: 'Members who joined within the last 7 days.',
    note: 'These members are new to the community. A welcome or onboarding check-in may be appropriate.',
    navId: 'nav-newly'
  },
  'highly-active': {
    label: 'Highly Active',
    title: '🟣 Highly Active Members',
    className: 'highly',
    description: 'Members with 5 or more meaningful activities in the last 14 days.',
    note: 'These members are highly engaged. High engagement reflects community participation only and must NOT be interpreted as commercial intent or intent to purchase.',
    navId: 'nav-highly'
  },
  'at-risk': {
    label: 'At Risk Members',
    title: '🟠 At Risk Members',
    className: 'risk',
    description: 'Members with no meaningful activity for 15–30 days.',
    note: 'These members may be disengaging. Review their history carefully before deciding on any action.',
    navId: 'nav-atrisk'
  },
  'dormant': {
    label: 'Dormant Members',
    title: '🔴 Dormant Members',
    className: 'dormant',
    description: 'Members with no meaningful activity for more than 30 days.',
    note: 'These members have been inactive for over a month. Human review is essential before any re-engagement consideration.',
    navId: 'nav-dormant'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state');
  const config = STATE_CONFIG[state];

  if (!config) {
    document.getElementById('focused-content').innerHTML =
      `<div class="alert alert-danger">Invalid state parameter. Please navigate from the sidebar.</div>`;
    return;
  }

  initPage(config.label);
  // Manually highlight correct nav
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navEl = document.getElementById(config.navId);
  if (navEl) navEl.classList.add('active');

  loadFocused(state, config);
});

async function loadFocused(state, config) {
  try {
    const members = await API.get(`/focused/${state}`);
    renderFocused(members, config);
  } catch (err) {
    document.getElementById('focused-content').innerHTML =
      `<div class="alert alert-danger">Failed to load data. Is the server running?</div>`;
  }
}

function renderFocused(members, config) {
  const container = document.getElementById('focused-content');

  let html = `
    <div class="page-header">
      <h1>${config.title}</h1>
      <p>${config.description}</p>
    </div>

    <div class="alert alert-${config.className === 'highly' ? 'warning' : 'info'}" style="margin-bottom:20px;">
      <strong>Note:</strong> ${config.note}
    </div>`;

  if (!members.length) {
    html += `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p>No members in this category right now.</p>
        </div>
      </div>`;
    container.innerHTML = html;
    return;
  }

  const rows = members.map(m => {
    const lastAct = m.lastActivityDate ? formatDate(m.lastActivityDate) : '—';
    const daysAgoStr = m.lastActivityDate ? `(${daysAgo(m.lastActivityDate)} days ago)` : '';
    return `
      <tr>
        <td>
          <div class="td-name">${escHtml(m.name)}</div>
          <div class="td-sub">${escHtml(m.role)}</div>
        </td>
        <td>${escHtml(m.company)}</td>
        <td>${stateBadge(m.activityState)}</td>
        <td>
          <div>${lastAct}</div>
          <div class="td-sub">${daysAgoStr}</div>
        </td>
        <td>${escHtml(m.owner || '—')}</td>
        <td style="max-width:200px;font-size:12px;color:var(--gray-600);">${escHtml(m.nextAction || '—')}</td>
        <td><a href="member.html?id=${m._id}" class="btn btn-ghost btn-sm">View</a></td>
      </tr>`;
  }).join('');

  html += `
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="focused-header ${config.className}" style="padding:16px 20px;">
        <span style="font-size:13px;font-weight:600;">
          ${members.length} member${members.length !== 1 ? 's' : ''} in this category
        </span>
      </div>
      <div class="table-wrapper" style="border:none;border-radius:0;">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
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
      <div style="padding:12px 16px;border-top:1px solid var(--gray-100);font-size:12px;color:var(--gray-400);">
        All data is fictional demo data for academic purposes only. Activity states are calculated using CRM rules defined for this assignment.
      </div>
    </div>`;

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
