const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Member = require('../models/Member');

// Helper: check if string is a valid ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Helper: serialize member with virtuals
function serializeMember(m) {
  const obj = m.toObject({ virtuals: true });
  return obj;
}

// ─── GET /api/members ──────────────────────────────────────────────────────────
// Query params: search, state, space, owner
router.get('/', async (req, res) => {
  try {
    const { search, state, space, owner } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { role: regex },
        { company: regex },
        { email: regex }
      ];
    }

    if (owner) query.owner = new RegExp(owner, 'i');

    let members = await Member.find(query).sort({ joinedDate: -1 });

    // Apply virtual filters after fetching (state and space are computed/nested)
    if (state) {
      members = members.filter(m => m.computedActivityState === state);
    }

    if (space) {
      members = members.filter(m =>
        (m.activities || []).some(a => a.space === space)
      );
    }

    res.json(members.map(serializeMember));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});

// ─── GET /api/members/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid member ID' });
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(serializeMember(member));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve member' });
  }
});

// ─── POST /api/members ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, role, company, email, joinedDate, owner, nextAction, notes, commercialSignal } = req.body;
    if (!name || !role || !company || !email || !joinedDate) {
      return res.status(400).json({ error: 'Name, role, company, email and joinedDate are required' });
    }
    const member = new Member({
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      email: email.trim().toLowerCase(),
      joinedDate: new Date(joinedDate),
      owner: owner ? owner.trim() : 'Unassigned',
      nextAction: nextAction ? nextAction.trim() : 'None',
      notes: notes ? notes.trim() : '',
      commercialSignal: commercialSignal || 'Not assessed',
      activities: []
    });
    await member.save();
    res.status(201).json(serializeMember(member));
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(409).json({ error: 'A member with this email already exists' });
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// ─── PUT /api/members/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid member ID' });
    const { name, role, company, email, owner, nextAction, notes, commercialSignal } = req.body;

    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Update allowed fields — do NOT touch activities or joinedDate
    if (name) member.name = name.trim();
    if (role) member.role = role.trim();
    if (company) member.company = company.trim();
    if (email) member.email = email.trim().toLowerCase();
    if (owner !== undefined) member.owner = owner.trim();
    if (nextAction !== undefined) member.nextAction = nextAction.trim();
    if (notes !== undefined) member.notes = notes.trim();
    if (commercialSignal) member.commercialSignal = commercialSignal;

    await member.save();
    res.json(serializeMember(member));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// ─── GET /api/members/:id/activities ──────────────────────────────────────────
router.get('/:id/activities', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid member ID' });
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const sorted = [...member.activities].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve activities' });
  }
});

// ─── POST /api/members/:id/activities ─────────────────────────────────────────
router.post('/:id/activities', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid member ID' });
    const { activityType, space, date, description } = req.body;
    if (!activityType || !space || !date || !description) {
      return res.status(400).json({ error: 'activityType, space, date and description are required' });
    }

    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    member.activities.push({ activityType, space, date: new Date(date), description });
    await member.save();

    res.status(201).json(serializeMember(member));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

module.exports = router;
