const mongoose = require('mongoose');

// Sub-schema for individual activities
const activitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    required: true,
    enum: ['Question', 'Post', 'Comment', 'Reply', 'Resource Interaction', 'Discussion Participation']
  },
  space: {
    type: String,
    required: true,
    enum: [
      'Ask Finance Peers',
      'Finance Workflows',
      'Tools & Systems',
      'Career & Compensation',
      'Water Cooler',
      'Interviews & Stories',
      'Curated Jobs'
    ]
  },
  date: { type: Date, required: true },
  description: { type: String, required: true }
}, { _id: true });

// Main Member schema
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  joinedDate: { type: Date, required: true },
  owner: { type: String, default: 'Unassigned', trim: true },
  nextAction: { type: String, default: 'None', trim: true },
  notes: { type: String, default: '', trim: true },
  commercialSignal: {
    type: String,
    default: 'Not assessed',
    enum: ['Not assessed', 'Requires human review']
  },
  activities: [activitySchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: compute last activity date from activities array
memberSchema.virtual('lastActivityDate').get(function () {
  if (!this.activities || this.activities.length === 0) return null;
  const sorted = [...this.activities].sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted[0].date;
});

// Virtual: compute activity state based on CRM rules
memberSchema.virtual('computedActivityState').get(function () {
  const now = new Date();

  // Rule 1: Newly Joined — joined within last 7 days
  const joinedDate = new Date(this.joinedDate);
  const daysSinceJoined = (now - joinedDate) / (1000 * 60 * 60 * 24);
  if (daysSinceJoined <= 7) return 'Newly Joined';

  // Count activities in last 14 days
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const recentActivities = (this.activities || []).filter(a => new Date(a.date) >= fourteenDaysAgo);

  // Rule 2: Highly Active — 5 or more in last 14 days
  if (recentActivities.length >= 5) return 'Highly Active';

  // Rule 3: Active — 2 to 4 in last 14 days
  if (recentActivities.length >= 2) return 'Active';

  // Find most recent activity date
  const lastDate = this.lastActivityDate;

  if (!lastDate) {
    // No activity at all — check how long since joined
    if (daysSinceJoined > 30) return 'Dormant';
    if (daysSinceJoined > 15) return 'At Risk';
    return 'Active'; // Recently joined but no activities yet (edge case)
  }

  const daysSinceActivity = (now - new Date(lastDate)) / (1000 * 60 * 60 * 24);

  // Rule 4: At Risk — 15 to 30 days without meaningful activity
  if (daysSinceActivity > 30) return 'Dormant';
  if (daysSinceActivity >= 15) return 'At Risk';

  // Otherwise they have activity within last 14 days but < 2 — still show as recent
  return 'Active';
});

module.exports = mongoose.model('Member', memberSchema);
