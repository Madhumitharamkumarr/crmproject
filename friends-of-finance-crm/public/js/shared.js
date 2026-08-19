/**
 * shared.js — Common utilities, navigation, toast, modal helpers
 * Used across all pages of Friends of Finance CRM
 */

/* ── Active nav link ─────────────────────────────────────────────────────── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
}

/* ── Toast notifications ──────────────────────────────────────────────────── */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ── Activity state badge HTML ────────────────────────────────────────────── */
function stateBadge(state) {
  const map = {
    'Newly Joined': 'badge-newly',
    'Active':       'badge-active',
    'Highly Active':'badge-highly',
    'At Risk':      'badge-risk',
    'Dormant':      'badge-dormant'
  };
  const cls = map[state] || 'badge-active';
  const dots = {
    'Newly Joined': '🔵',
    'Active':       '🟢',
    'Highly Active':'🟣',
    'At Risk':      '🟠',
    'Dormant':      '🔴'
  };
  return `<span class="badge ${cls}">${dots[state] || ''} ${state || 'Unknown'}</span>`;
}

/* ── Date formatting ──────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ── Days ago ──────────────────────────────────────────────────────────────── */
function daysAgo(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const d = new Date(dateStr);
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

/* ── Activity type badge ───────────────────────────────────────────────────── */
function activityTypeBadge(type) {
  const colours = {
    'Question':               'background:#dbeafe;color:#1d4ed8',
    'Post':                   'background:#d1fae5;color:#065f46',
    'Comment':                'background:#ede9fe;color:#5b21b6',
    'Reply':                  'background:#fce7f3;color:#9d174d',
    'Resource Interaction':   'background:#fef3c7;color:#92400e',
    'Discussion Participation':'background:#e0f2fe;color:#0369a1'
  };
  const style = colours[type] || 'background:#f3f4f6;color:#374151';
  return `<span class="badge" style="${style};font-size:11px;">${type}</span>`;
}

/* ── Mobile menu toggle ────────────────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* ── Sidebar HTML ─────────────────────────────────────────────────────────── */
const SIDEBAR_HTML = `
<div class="sidebar-brand">
  <div class="brand-icon">💼</div>
  <h2>Friends of Finance</h2>
  <p>Community CRM</p>
</div>
<nav class="sidebar-nav">
  <div class="nav-section-label">Overview</div>
  <a href="index.html" class="nav-link" id="nav-dashboard">
    <span class="nav-icon">📊</span> Dashboard
  </a>
  <a href="members.html" class="nav-link" id="nav-members">
    <span class="nav-icon">👥</span> Members
  </a>
  <a href="followups.html" class="nav-link" id="nav-followups">
    <span class="nav-icon">🔔</span> Follow-ups
  </a>

  <div class="nav-section-label" style="margin-top:8px;">Focused Views</div>
  <a href="focused.html?state=newly-joined" class="nav-link" id="nav-newly">
    <span class="nav-icon">🔵</span> New Members
  </a>
  <a href="focused.html?state=highly-active" class="nav-link" id="nav-highly">
    <span class="nav-icon">🟣</span> Highly Active
  </a>
  <a href="focused.html?state=at-risk" class="nav-link" id="nav-atrisk">
    <span class="nav-icon">🟠</span> At Risk
  </a>
  <a href="focused.html?state=dormant" class="nav-link" id="nav-dormant">
    <span class="nav-icon">🔴</span> Dormant
  </a>

  <div class="nav-section-label" style="margin-top:8px;">Support</div>
  <a href="help.html" class="nav-link" id="nav-help">
    <span class="nav-icon">❓</span> Help & Testing
  </a>
</nav>
<div class="sidebar-footer">
  <span class="demo-badge-sidebar">Fictional Demo Data</span>
</div>
`;

/* ── Topbar HTML ──────────────────────────────────────────────────────────── */
function renderTopbar(title) {
  return `
  <div class="topbar-left">
    <button class="menu-toggle" id="menu-toggle" aria-label="Open menu">☰</button>
    <span class="topbar-title">${title}</span>
  </div>
  <div class="topbar-right">
    <span class="demo-badge">⚠ Fictional Demo Data</span>
  </div>
  `;
}

/* ── Init page ─────────────────────────────────────────────────────────────── */
function initPage(title) {
  // Inject sidebar
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) sidebarEl.innerHTML = SIDEBAR_HTML;

  // Inject topbar
  const topbarEl = document.getElementById('topbar');
  if (topbarEl) topbarEl.innerHTML = renderTopbar(title);

  // Set active nav
  setActiveNav();
  initMobileMenu();
}

/* ── API helpers ───────────────────────────────────────────────────────────── */
const API = {
  base: '/api',

  async get(path) {
    const r = await fetch(this.base + path);
    if (!r.ok) throw new Error(`API error ${r.status}`);
    return r.json();
  },

  async post(path, body) {
    const r = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `API error ${r.status}`);
    }
    return r.json();
  },

  async put(path, body) {
    const r = await fetch(this.base + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `API error ${r.status}`);
    }
    return r.json();
  }
};
