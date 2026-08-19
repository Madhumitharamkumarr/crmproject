require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Database connection
const configuredUri = process.env.MONGO_URI;
let MONGO_URI = configuredUri;
const validScheme = /^mongodb(\+srv)?:\/\//i;
if (!configuredUri) {
  console.warn(
    "⚠️ MONGO_URI not set. Falling back to local MongoDB at mongodb://127.0.0.1:27017/friends_of_finance",
  );
  MONGO_URI = "mongodb://127.0.0.1:27017/friends_of_finance";
} else if (!validScheme.test(configuredUri)) {
  console.warn(
    '⚠️ Invalid MONGO_URI scheme detected. Expected string starting with "mongodb://" or "mongodb+srv://". Falling back to local MongoDB.',
  );
  MONGO_URI = "mongodb://127.0.0.1:27017/friends_of_finance";
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message || err);
    console.error("Tried URI:", MONGO_URI);
    process.exit(1);
  });

// Routes
const membersRouter = require("./routes/members");
app.use("/api/members", membersRouter);

// Dashboard API
app.get("/api/dashboard", async (req, res) => {
  try {
    const Member = require("./models/Member");
    const members = await Member.find({});
    const now = new Date();

    let newlyJoined = 0,
      highlyActive = 0,
      active = 0,
      atRisk = 0,
      dormant = 0,
      followupsDue = 0;

    members.forEach((m) => {
      const state = m.computedActivityState;
      if (state === "Newly Joined") newlyJoined++;
      else if (state === "Highly Active") highlyActive++;
      else if (state === "Active") active++;
      else if (state === "At Risk") atRisk++;
      else if (state === "Dormant") dormant++;
      if (
        state === "At Risk" ||
        state === "Dormant" ||
        state === "Newly Joined"
      )
        followupsDue++;
    });

    // Activity breakdown by space
    const spaceActivity = {};
    members.forEach((m) => {
      (m.activities || []).forEach((a) => {
        spaceActivity[a.space] = (spaceActivity[a.space] || 0) + 1;
      });
    });

    res.json({
      total: members.length,
      newlyJoined,
      highlyActive,
      active,
      atRisk,
      dormant,
      followupsDue,
      spaceActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// Follow-ups API
app.get("/api/followups", async (req, res) => {
  try {
    const Member = require("./models/Member");
    const members = await Member.find({});
    const followups = members
      .filter((m) =>
        ["At Risk", "Dormant", "Newly Joined"].includes(
          m.computedActivityState,
        ),
      )
      .map((m) => ({
        _id: m._id,
        name: m.name,
        role: m.role,
        company: m.company,
        activityState: m.computedActivityState,
        lastActivityDate: m.lastActivityDate,
        owner: m.owner,
        nextAction: m.nextAction,
      }))
      .sort((a, b) => {
        const priority = { Dormant: 0, "At Risk": 1, "Newly Joined": 2 };
        return (
          (priority[a.activityState] ?? 3) - (priority[b.activityState] ?? 3)
        );
      });
    res.json(followups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load follow-ups" });
  }
});

// Focused views API
app.get("/api/focused/:state", async (req, res) => {
  try {
    const Member = require("./models/Member");
    const stateMap = {
      "newly-joined": "Newly Joined",
      "highly-active": "Highly Active",
      "at-risk": "At Risk",
      dormant: "Dormant",
    };
    const targetState = stateMap[req.params.state];
    if (!targetState)
      return res.status(400).json({ error: "Invalid state parameter" });

    const members = await Member.find({});
    const filtered = members
      .filter((m) => m.computedActivityState === targetState)
      .map((m) => ({
        _id: m._id,
        name: m.name,
        role: m.role,
        company: m.company,
        activityState: m.computedActivityState,
        lastActivityDate: m.lastActivityDate,
        owner: m.owner,
        nextAction: m.nextAction,
      }));
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load focused view" });
  }
});

// Catch-all: serve index.html for any unrecognised route (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server (only if run directly, not imported in Vercel serverless context)
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Friends of Finance CRM running at http://localhost:${PORT}`);
  });
}

module.exports = app;
