/**
 * member.js — Member detail page
 * Shows profile, activity history, edit form, add activity, and AI recommendation.
 */

let memberId = null;
let currentMember = null;

document.addEventListener('DOMContentLoaded', () => {
  initPage('Member Profile');
  const params = new URLSearchParams(window.location.search);
  memberId = params.get('id');
  if (!memberId) {
    renderError('No member ID provided. Please go back to the Members page.');
    return;
  }
  loadMember();

  // Set today's date as default for activity date
  const actDate = document.getElementById('act-date');
  if (actDate) actDate.value = new Date().toISOString().split('T')[0];
});

async function loadMember() {
  try {
    currentMember = await API.get(`/members/${memberId}`);
    document.title = `${currentMember.name} — Friends of Finance CRM`;
    initPage(`${currentMember.name}`);
    renderProfile(currentMember);
  } catch (err) {
    renderError('Failed to load member. The member may not exist or the server may be unavailable.');
  }
}

function renderProfile(m) {
  const initials = m.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const activities = [...(m.activities || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  const activityRows = activities.length === 0
    ? `<div class="empty-state" style="padding:40px 20px;">
        <div class="empty-icon">📋</div>
        <p>No activities recorded yet. Add the first activity below.</p>
      </div>`
    : activities.map(a => `
      <div class="activity-item">
        <div class="activity-dot"></div>
        <div class="activity-content">
          <div class="activity-meta">
            <span class="activity-date">${formatDate(a.date)}</span>
            ${activityTypeBadge(a.activityType)}
            <span class="badge" style="background:var(--gray-100);color:var(--gray-600);font-size:11px;">
              ${escHtml(a.space)}
            </span>
          </div>
          <div class="activity-desc">"${escHtml(a.description)}"</div>
        </div>
      </div>`).join('');

  document.getElementById('page-body').innerHTML = `
    <a href="members.html" class="back-link">← Back to Members</a>

    <!-- Member Profile Card -->
    <div class="card" style="margin-bottom:20px;">
      <div class="member-profile-header">
        <div class="member-avatar">${initials}</div>
        <div class="member-info">
          <h1>${escHtml(m.name)}</h1>
          <div class="member-sub">${escHtml(m.role)} · ${escHtml(m.company)}</div>
          <div style="margin-top:8px;">${stateBadge(m.computedActivityState)}</div>
        </div>
        <div style="margin-left:auto;">
          <button class="btn btn-secondary btn-sm" onclick="openEditPanel()">✏ Edit Profile</button>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <label>Email</label>
          <div class="detail-value">${escHtml(m.email)}</div>
        </div>
        <div class="detail-item">
          <label>Joined Date</label>
          <div class="detail-value">${formatDate(m.joinedDate)}</div>
        </div>
        <div class="detail-item">
          <label>Last Activity</label>
          <div class="detail-value">${m.lastActivityDate ? formatDate(m.lastActivityDate) : '—'}</div>
        </div>
        <div class="detail-item">
          <label>Total Activities</label>
          <div class="detail-value">${(m.activities || []).length}</div>
        </div>
        <div class="detail-item">
          <label>Owner</label>
          <div class="detail-value">${escHtml(m.owner || '—')}</div>
        </div>
        <div class="detail-item">
          <label>Next Action</label>
          <div class="detail-value">${escHtml(m.nextAction || '—')}</div>
        </div>
        <div class="detail-item">
          <label>Commercial Signal</label>
          <div class="detail-value" style="font-size:12px;color:var(--gray-500);">
            ${escHtml(m.commercialSignal || 'Not assessed')}
            <span style="display:block;font-size:11px;color:var(--gray-400);margin-top:2px;">
              Not used in activity scoring
            </span>
          </div>
        </div>
      </div>

      ${m.notes ? `
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--gray-100);">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--gray-400);margin-bottom:6px;">Internal Notes</div>
        <p style="font-size:13.5px;color:var(--gray-600);">${escHtml(m.notes)}</p>
      </div>` : ''}
    </div>

    <!-- Edit Profile Panel (hidden by default) -->
    <div id="edit-panel" class="card" style="margin-bottom:20px;display:none;border:2px solid var(--brand-accent);">
      <div class="card-header">
        <span class="card-title">Edit Member Profile</span>
        <button class="btn btn-ghost btn-sm" onclick="closeEditPanel()">Cancel</button>
      </div>
      <form class="form-grid" id="edit-profile-form" onsubmit="submitEditProfile(event)">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="ep-name" value="${escHtml(m.name)}" required />
        </div>
        <div class="form-group">
          <label>Role / Title *</label>
          <input type="text" id="ep-role" value="${escHtml(m.role)}" required />
        </div>
        <div class="form-group">
          <label>Company *</label>
          <input type="text" id="ep-company" value="${escHtml(m.company)}" required />
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input type="email" id="ep-email" value="${escHtml(m.email)}" required />
        </div>
        <div class="form-group">
          <label>Owner</label>
          <select id="ep-owner">
            <option value="Unassigned" ${m.owner === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
            <option value="Sarah Bennett" ${m.owner === 'Sarah Bennett' ? 'selected' : ''}>Sarah Bennett</option>
            <option value="Marcus Liu" ${m.owner === 'Marcus Liu' ? 'selected' : ''}>Marcus Liu</option>
          </select>
        </div>
        <div class="form-group">
          <label>Commercial Signal</label>
          <select id="ep-commercial">
            <option value="Not assessed" ${m.commercialSignal === 'Not assessed' ? 'selected' : ''}>Not assessed</option>
            <option value="Requires human review" ${m.commercialSignal === 'Requires human review' ? 'selected' : ''}>Requires human review</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label>Next Action</label>
          <input type="text" id="ep-next-action" value="${escHtml(m.nextAction || '')}" />
        </div>
        <div class="form-group full-width">
          <label>Notes</label>
          <textarea id="ep-notes" rows="3">${escHtml(m.notes || '')}</textarea>
        </div>
      </form>
      <div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="closeEditPanel()">Cancel</button>
        <button class="btn btn-primary" id="ep-submit-btn" onclick="submitEditProfile(event)">Save Changes</button>
      </div>
    </div>

    <!-- Activity History -->
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header">
        <span class="card-title">Activity History</span>
        <button class="btn btn-primary btn-sm" onclick="openActivityModal()">+ Add Activity</button>
      </div>
      <div class="activity-timeline" id="activity-timeline">
        ${activityRows}
      </div>
    </div>

    <!-- AI Recommendation -->
    <div class="ai-box">
      <div class="ai-box-header">
        <span class="ai-badge">🤖 AI Feature</span>
        <span class="card-title" style="font-size:15px;">AI Suggested Next Step</span>
      </div>
      <p style="font-size:13px;color:var(--gray-600);margin-bottom:12px;">
        Click the button below to generate a simulated suggested next step based on this member's role, 
        recent activity, and engagement state.
      </p>
      <button class="btn btn-primary" id="ai-btn" onclick="generateAISuggestion()">
        🤖 Generate Suggested Next Step
      </button>
      <div id="ai-result" style="display:none;margin-top:12px;">
        <div class="ai-recommendation" id="ai-recommendation-text"></div>
        <div class="ai-safeguards">
          <div class="ai-safeguard-item">AI recommendation is simulated for this assignment. It uses rule-based logic, not a paid AI API.</div>
          <div class="ai-safeguard-item">AI does not send messages automatically. Human review is always required.</div>
          <div class="ai-safeguard-item">AI does not invent personalisation or access external data.</div>
          <div class="ai-safeguard-item">Community activity must NOT be treated as commercial intent.</div>
          <div class="ai-safeguard-item">AI does not infer buying intent. This member is not a sales lead.</div>
        </div>
      </div>
    </div>`;
}

function openEditPanel() {
  document.getElementById('edit-panel').style.display = 'block';
  document.getElementById('edit-panel').scrollIntoView({ behavior: 'smooth' });
}

function closeEditPanel() {
  document.getElementById('edit-panel').style.display = 'none';
}

async function submitEditProfile(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('ep-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    const body = {
      name:             document.getElementById('ep-name').value.trim(),
      role:             document.getElementById('ep-role').value.trim(),
      company:          document.getElementById('ep-company').value.trim(),
      email:            document.getElementById('ep-email').value.trim(),
      owner:            document.getElementById('ep-owner').value,
      nextAction:       document.getElementById('ep-next-action').value.trim(),
      notes:            document.getElementById('ep-notes').value.trim(),
      commercialSignal: document.getElementById('ep-commercial').value
    };

    currentMember = await API.put(`/members/${memberId}`, body);
    showToast('Profile updated successfully.', 'success');
    renderProfile(currentMember);
  } catch (err) {
    showToast(err.message || 'Failed to update profile.', 'error');
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}

/* ── Activity Modal ────────────────────────────────────────────────────────── */
function openActivityModal() {
  document.getElementById('activity-form').reset();
  document.getElementById('act-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('activity-modal').style.display = 'flex';
}

function closeActivityModal() {
  document.getElementById('activity-modal').style.display = 'none';
}

async function submitActivity(e) {
  if (e) e.preventDefault();
  const btn = document.getElementById('act-submit-btn');
  const activityType = document.getElementById('act-type').value;
  const space        = document.getElementById('act-space').value;
  const date         = document.getElementById('act-date').value;
  const description  = document.getElementById('act-desc').value.trim();

  if (!activityType || !space || !date || !description) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    currentMember = await API.post(`/members/${memberId}/activities`, {
      activityType, space, date, description
    });
    showToast('Activity added. Activity state recalculated.', 'success');
    closeActivityModal();
    renderProfile(currentMember);
  } catch (err) {
    showToast(err.message || 'Failed to add activity.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Activity';
  }
}

/* ── AI Suggestion (Simulated Rule-Based) ──────────────────────────────────── */
function generateAISuggestion() {
  const btn = document.getElementById('ai-btn');
  btn.disabled = true;
  btn.textContent = '🤖 Generating…';

  // Simulate processing delay
  setTimeout(() => {
    const suggestion = buildSuggestion(currentMember);
    document.getElementById('ai-recommendation-text').innerHTML = suggestion;
    document.getElementById('ai-result').style.display = 'block';
    document.getElementById('ai-result').scrollIntoView({ behavior: 'smooth' });
    btn.disabled = false;
    btn.textContent = '🤖 Regenerate Suggestion';
  }, 800);
}

function buildSuggestion(m) {
  const state = m.computedActivityState;
  const activities = m.activities || [];
  const recentActivities = activities.filter(a => {
    const d = new Date(a.date);
    const now = new Date();
    return (now - d) / (1000 * 60 * 60 * 24) <= 14;
  });

  // Count spaces
  const spaceCounts = {};
  activities.forEach(a => { spaceCounts[a.space] = (spaceCounts[a.space] || 0) + 1; });
  const topSpace = Object.entries(spaceCounts).sort((a, b) => b[1] - a[1])[0];

  // Count activity types
  const typeCounts = {};
  activities.forEach(a => { typeCounts[a.activityType] = (typeCounts[a.activityType] || 0) + 1; });
  const asksQuestions = (typeCounts['Question'] || 0) >= 2;
  const sharesPosts   = (typeCounts['Post'] || 0) >= 2;

  let rec = '';

  if (state === 'Newly Joined') {
    rec = `<strong>Suggested next step for ${escHtml(m.name)} (Newly Joined):</strong><br><br>
    Consider completing a welcome/check-in action for this newly joined member. 
    As ${escHtml(m.name)} is in the early stages of their membership, a warm, 
    personalised onboarding message (reviewed by a human before sending) may help them find relevant discussions 
    in the community. You might highlight spaces such as <em>Ask Finance Peers</em> or 
    <em>Finance Workflows</em> that align with their role as a ${escHtml(m.role)}.`;
  } else if (state === 'Highly Active') {
    rec = `<strong>Suggested next step for ${escHtml(m.name)} (Highly Active):</strong><br><br>
    This member is highly engaged with ${recentActivities.length} activities in the last 14 days. 
    ${topSpace ? `They are particularly active in <em>${escHtml(topSpace[0])}</em>. ` : ''}
    Consider acknowledging their contributions and, if appropriate, inviting them to participate in 
    a relevant peer discussion or community spotlight. 
    <br><br><em>Note: High engagement reflects community participation only and must not be interpreted as commercial intent.</em>`;
  } else if (state === 'Active') {
    if (asksQuestions && topSpace) {
      rec = `<strong>Suggested next step for ${escHtml(m.name)} (Active):</strong><br><br>
      ${escHtml(m.name)} frequently asks questions, particularly in <em>${escHtml(topSpace[0])}</em>. 
      Consider identifying a relevant peer discussion thread or resource that may help address their recent questions. 
      A community manager could also encourage them to share their own experiences as a ${escHtml(m.role)}.`;
    } else if (sharesPosts && topSpace) {
      rec = `<strong>Suggested next step for ${escHtml(m.name)} (Active):</strong><br><br>
      ${escHtml(m.name)} regularly shares posts, particularly in <em>${escHtml(topSpace[0])}</em>. 
      Consider inviting them to contribute to another relevant ${escHtml(topSpace[0])} discussion, 
      or introducing them to other community members with similar interests.`;
    } else {
      rec = `<strong>Suggested next step for ${escHtml(m.name)} (Active):</strong><br><br>
      ${escHtml(m.name)} is actively engaged in the community. 
      ${topSpace ? `Their most active space is <em>${escHtml(topSpace[0])}</em>. ` : ''}
      Consider inviting them to participate in another relevant discussion that aligns with 
      their expertise as a ${escHtml(m.role)}.`;
    }
  } else if (state === 'At Risk') {
    rec = `<strong>Suggested next step for ${escHtml(m.name)} (At Risk):</strong><br><br>
    This member has not had meaningful activity for 15–30 days. 
    Before taking any action, a community manager should review their activity history to understand their previous engagement patterns. 
    ${topSpace ? `Their most active space was <em>${escHtml(topSpace[0])}</em>. ` : ''}
    If a re-engagement action is considered appropriate, it should be a respectful, 
    value-focused message — not a commercial outreach. Any action requires human review before sending.`;
  } else if (state === 'Dormant') {
    rec = `<strong>Suggested next step for ${escHtml(m.name)} (Dormant):</strong><br><br>
    This member has had no meaningful activity for more than 30 days. 
    A community manager should carefully review their full history before deciding whether any action is appropriate. 
    If a re-engagement message is considered, it must be respectful and not assume any commercial intent. 
    ${topSpace ? `Their historical activity was mainly in <em>${escHtml(topSpace[0])}</em>. ` : ''}
    No automated messages should be sent. Human judgement is essential here.`;
  } else {
    rec = `<strong>Suggested next step for ${escHtml(m.name)}:</strong><br><br>
    Review this member's profile and recent activity history. Based on their role as a ${escHtml(m.role)}, 
    consider identifying relevant community discussions or resources that may be of value to them.`;
  }

  return rec;
}

function renderError(msg) {
  document.getElementById('page-body').innerHTML = `
    <a href="members.html" class="back-link">← Back to Members</a>
    <div class="alert alert-danger">${msg}</div>`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
