/**
 * dashboard.js — Friends of Finance CRM Dashboard
 * Loads KPI data and renders Chart.js visualisations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPage('Dashboard');
  loadDashboard();
});

async function loadDashboard() {
  try {
    const data = await API.get('/dashboard');
    renderKPIs(data);
    renderStateChart(data);
    renderSpaceChart(data);
    loadAttentionList();
  } catch (err) {
    console.error(err);
    showToast('Failed to load dashboard data.', 'error');
  }
}

function renderKPIs(data) {
  document.getElementById('kpi-total').textContent   = data.total   ?? 0;
  document.getElementById('kpi-new').textContent     = data.newlyJoined  ?? 0;
  document.getElementById('kpi-active').textContent  = data.active   ?? 0;
  document.getElementById('kpi-highly').textContent  = data.highlyActive ?? 0;
  document.getElementById('kpi-risk').textContent    = data.atRisk    ?? 0;
  document.getElementById('kpi-dormant').textContent = data.dormant   ?? 0;
  document.getElementById('kpi-followup').textContent= data.followupsDue ?? 0;
}

function renderStateChart(data) {
  const ctx = document.getElementById('stateChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Newly Joined', 'Active', 'Highly Active', 'At Risk', 'Dormant'],
      datasets: [{
        data: [
          data.newlyJoined,
          data.active,
          data.highlyActive,
          data.atRisk,
          data.dormant
        ],
        backgroundColor: ['#1d4ed8', '#059669', '#7c3aed', '#d97706', '#dc2626'],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 14, font: { size: 12, family: 'Inter' }, boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} member${ctx.parsed !== 1 ? 's' : ''}`
          }
        }
      }
    }
  });
}

function renderSpaceChart(data) {
  const ctx = document.getElementById('spaceChart').getContext('2d');
  const spaces = data.spaceActivity || {};
  const labels = Object.keys(spaces);
  const values = Object.values(spaces);

  const colours = [
    '#3f83f8', '#059669', '#7c3aed', '#d97706',
    '#dc2626', '#0891b2', '#db2777'
  ];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Activities',
        data: values,
        backgroundColor: colours.slice(0, labels.length),
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'Inter' } }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 11, family: 'Inter' } },
          grid: { color: '#f3f4f6' }
        }
      }
    }
  });
}

async function loadAttentionList() {
  try {
    const members = await API.get('/followups');
    const el = document.getElementById('attention-list');

    if (!members.length) {
      el.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p>No members need immediate attention right now.</p>
        </div>`;
      return;
    }

    const rows = members.slice(0, 8).map(m => `
      <tr>
        <td>
          <div class="td-name">${escHtml(m.name)}</div>
          <div class="td-sub">${escHtml(m.role)} · ${escHtml(m.company)}</div>
        </td>
        <td>${stateBadge(m.activityState)}</td>
        <td>${formatDate(m.lastActivityDate)}</td>
        <td>${escHtml(m.owner || '—')}</td>
        <td><a href="member.html?id=${m._id}" class="btn btn-ghost btn-sm">View</a></td>
      </tr>
    `).join('');

    el.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>State</th>
              <th>Last Activity</th>
              <th>Owner</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch (err) {
    document.getElementById('attention-list').innerHTML =
      `<div class="alert alert-danger">Failed to load attention list.</div>`;
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
