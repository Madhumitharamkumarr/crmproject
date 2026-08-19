/**
 * seed.js — Fictional Demo Data Seeder
 *
 * DISCLAIMER: All member names, companies, roles, and activities are
 * entirely fictional and created for academic demonstration purposes only.
 * They do NOT represent real people or actual Friends of Finance community activity.
 *
  // ─── ADDITIONAL SAMPLES ───────────────────────────────────────────────
  {
    name: 'Maya Patel',
    role: 'Finance Analyst',
    company: 'GreenLeaf Capital',
    email: 'maya.patel@greenleaf.example',
    joinedDate: daysAgo(1),
    owner: 'Marcus Liu',
    nextAction: 'Welcome and share onboarding resources',
    notes: 'Newly joined; interested in modelling and forecasting.',
    commercialSignal: 'Not assessed',
    activities: [
      {
        activityType: 'Post',
        space: 'Water Cooler',
        date: daysAgo(0),
        description: 'Says hello and asks for recommended forecasting templates.'
      }
    ]
  },
  {
    name: 'Tom Williams',
    role: 'Senior Accountant',
    company: 'Harbor Logistics',
    email: 'tom.williams@harborlogistics.example',
    joinedDate: daysAgo(50),
    owner: 'Sarah Bennett',
    nextAction: 'Re-engage in AP discussions',
    notes: 'Occasional contributor focused on accounts payable and reconciliations.',
    commercialSignal: 'Not assessed',
    activities: [
      {
        activityType: 'Comment',
        space: 'Finance Workflows',
        date: daysAgo(6),
        description: 'Commented about improving reconciliation cadence for multi-site operations.'
      }
    ]
  },

 * Dates are set relative to 19 August 2026 to ensure activity-state
 * calculations work correctly at time of submission.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Member = require("../models/Member");

const configuredUri = process.env.MONGO_URI;
let MONGO_URI = configuredUri;
const validScheme = /^mongodb(\+srv)?:\/\//i;
if (!configuredUri) {
  console.warn(
    "⚠️ MONGO_URI not found in .env. Falling back to local MongoDB for seeding: mongodb://127.0.0.1:27017/friends_of_finance",
  );
  MONGO_URI = "mongodb://127.0.0.1:27017/friends_of_finance";
} else if (!validScheme.test(configuredUri)) {
  console.warn(
    '⚠️ Invalid MONGO_URI scheme detected in .env. Expected string starting with "mongodb://" or "mongodb+srv://". Falling back to local MongoDB for seeding.',
  );
  MONGO_URI = "mongodb://127.0.0.1:27017/friends_of_finance";
}

// Reference date: 19 August 2026
const REF = new Date("2026-08-19T00:00:00.000Z");

// Helper to subtract days from reference date
const daysAgo = (n) => new Date(REF.getTime() - n * 24 * 60 * 60 * 1000);

const members = [
  // ─── NEWLY JOINED (joined within last 7 days) ─────────────────────────────
  {
    name: "Aisha Khan",
    role: "Finance Business Partner",
    company: "Elevate Solutions",
    email: "aisha.khan@elevatesolutions.example",
    joinedDate: daysAgo(2),
    owner: "Sarah Bennett",
    nextAction: "Send welcome message",
    notes: "Referred by Arjun Shah. Interested in FP&A peer discussions.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Post",
        space: "Water Cooler",
        date: daysAgo(1),
        description:
          "Introduced herself to the community and shared her background in finance business partnering.",
      },
    ],
  },
  {
    name: "Nikhil Verma",
    role: "Finance Manager",
    company: "BlueStone Technologies",
    email: "nikhil.verma@bluestonetech.example",
    joinedDate: daysAgo(4),
    owner: "Marcus Liu",
    nextAction: "Schedule onboarding check-in",
    notes: "Interested in finance automation and ERP systems.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Question",
        space: "Tools & Systems",
        date: daysAgo(3),
        description:
          "Asked about best practices for integrating ERP systems with FP&A tools.",
      },
      {
        activityType: "Comment",
        space: "Finance Workflows",
        date: daysAgo(2),
        description: "Commented on a post about month-end close optimisation.",
      },
    ],
  },

  // ─── HIGHLY ACTIVE (5+ activities in last 14 days) ────────────────────────
  {
    name: "Ananya Rao",
    role: "FP&A Manager",
    company: "Northstar Analytics",
    email: "ananya.rao@northstaranalytics.example",
    joinedDate: daysAgo(90),
    owner: "Sarah Bennett",
    nextAction: "Invite to host a community session",
    notes:
      "Highly engaged. Regularly contributes to FP&A and workflow discussions.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Post",
        space: "Finance Workflows",
        date: daysAgo(1),
        description:
          "Shared a detailed post on improving monthly forecasting accuracy using rolling forecasts.",
      },
      {
        activityType: "Comment",
        space: "Ask Finance Peers",
        date: daysAgo(2),
        description:
          "Helped a peer with variance analysis methodology for board reporting.",
      },
      {
        activityType: "Question",
        space: "Tools & Systems",
        date: daysAgo(4),
        description:
          "Asked for peer recommendations on FP&A planning tools for mid-size companies.",
      },
      {
        activityType: "Reply",
        space: "Finance Workflows",
        date: daysAgo(6),
        description:
          "Replied to a discussion about driver-based budgeting approaches.",
      },
      {
        activityType: "Discussion Participation",
        space: "Career & Compensation",
        date: daysAgo(9),
        description:
          "Participated in a discussion about compensation benchmarks for FP&A managers.",
      },
      {
        activityType: "Resource Interaction",
        space: "Finance Workflows",
        date: daysAgo(12),
        description: "Shared a template for quarterly business review decks.",
      },
    ],
  },
  {
    name: "Rohan Kapoor",
    role: "Finance Transformation Lead",
    company: "Nova Systems",
    email: "rohan.kapoor@novasystems.example",
    joinedDate: daysAgo(120),
    owner: "Marcus Liu",
    nextAction: "Feature in Interviews & Stories",
    notes:
      "Subject-matter expert on finance transformation. Very active contributor.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Post",
        space: "Interviews & Stories",
        date: daysAgo(1),
        description:
          "Shared learnings from a large-scale finance transformation project at a manufacturing firm.",
      },
      {
        activityType: "Reply",
        space: "Tools & Systems",
        date: daysAgo(3),
        description:
          "Replied to a question about selecting finance automation platforms.",
      },
      {
        activityType: "Comment",
        space: "Finance Workflows",
        date: daysAgo(5),
        description:
          "Commented on a post about streamlining AP and AR processes.",
      },
      {
        activityType: "Discussion Participation",
        space: "Ask Finance Peers",
        date: daysAgo(7),
        description:
          "Participated in a peer Q&A on finance team restructuring.",
      },
      {
        activityType: "Resource Interaction",
        space: "Finance Workflows",
        date: daysAgo(10),
        description:
          "Interacted with a shared resource on process mapping for finance functions.",
      },
    ],
  },
  {
    name: "Priya Sharma",
    role: "Finance Operations Manager",
    company: "Horizon Digital",
    email: "priya.sharma@horizondigital.example",
    joinedDate: daysAgo(75),
    owner: "Sarah Bennett",
    nextAction: "Nominate for peer spotlight",
    notes:
      "Consistent contributor across multiple spaces. Very helpful to newer members.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Comment",
        space: "Ask Finance Peers",
        date: daysAgo(2),
        description:
          "Answered a question about handling multi-currency reconciliations in a global setup.",
      },
      {
        activityType: "Post",
        space: "Finance Workflows",
        date: daysAgo(4),
        description:
          "Posted a guide on structuring month-end close checklists for distributed finance teams.",
      },
      {
        activityType: "Reply",
        space: "Water Cooler",
        date: daysAgo(6),
        description:
          "Replied to a light-hearted discussion about finance team culture.",
      },
      {
        activityType: "Question",
        space: "Tools & Systems",
        date: daysAgo(8),
        description:
          "Asked about peer experience with spend management tools in fast-growth companies.",
      },
      {
        activityType: "Discussion Participation",
        space: "Interviews & Stories",
        date: daysAgo(11),
        description:
          "Participated in a session discussing career pivots within the finance function.",
      },
    ],
  },

  // ─── ACTIVE (2–4 activities in last 14 days) ──────────────────────────────
  {
    name: "Aditya Menon",
    role: "FP&A Analyst",
    company: "ClearPath Technologies",
    email: "aditya.menon@clearpath.example",
    joinedDate: daysAgo(60),
    owner: "Sarah Bennett",
    nextAction: "Encourage more peer contributions",
    notes:
      "Regular reader and occasional contributor. Good engagement in FP&A space.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Question",
        space: "Ask Finance Peers",
        date: daysAgo(3),
        description:
          "Asked about handling budget vs actuals variance reporting for fast-moving projects.",
      },
      {
        activityType: "Comment",
        space: "Finance Workflows",
        date: daysAgo(7),
        description:
          "Commented on a post about driver-based modelling in FP&A.",
      },
      {
        activityType: "Resource Interaction",
        space: "Finance Workflows",
        date: daysAgo(20),
        description: "Downloaded a shared Excel model for revenue forecasting.",
      },
    ],
  },
  {
    name: "Kavya Nair",
    role: "Treasury Analyst",
    company: "BluePeak Services",
    email: "kavya.nair@bluepeak.example",
    joinedDate: daysAgo(55),
    owner: "Marcus Liu",
    nextAction: "Suggest relevant treasury discussion thread",
    notes:
      "Focused on treasury and cash management topics. Steady contributor.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Question",
        space: "Finance Workflows",
        date: daysAgo(5),
        description:
          "Asked about best practices for daily cash position reporting in multi-bank environments.",
      },
      {
        activityType: "Reply",
        space: "Ask Finance Peers",
        date: daysAgo(10),
        description:
          "Replied to a peer query about hedging strategies for FX exposure.",
      },
      {
        activityType: "Post",
        space: "Tools & Systems",
        date: daysAgo(30),
        description:
          "Posted about treasury management system evaluation criteria.",
      },
    ],
  },
  {
    name: "Sneha Thomas",
    role: "AR Manager",
    company: "Meridian Services",
    email: "sneha.thomas@meridianservices.example",
    joinedDate: daysAgo(45),
    owner: "Sarah Bennett",
    nextAction: "Invite to AR-focused peer discussion",
    notes:
      "Active in Finance Workflows and Ask Finance Peers. Good knowledge of AR processes.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Post",
        space: "Finance Workflows",
        date: daysAgo(6),
        description:
          "Shared a step-by-step process for reducing DSO through proactive collections workflows.",
      },
      {
        activityType: "Comment",
        space: "Ask Finance Peers",
        date: daysAgo(12),
        description:
          "Commented on a question about automating invoice matching in high-volume AR environments.",
      },
    ],
  },
  {
    name: "Karan Patel",
    role: "Finance Systems Manager",
    company: "BrightCore",
    email: "karan.patel@brightcore.example",
    joinedDate: daysAgo(80),
    owner: "Marcus Liu",
    nextAction: "Invite to Tools & Systems discussion panel",
    notes:
      "Expert in finance systems and ERP implementations. Helpful contributor.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Post",
        space: "Tools & Systems",
        date: daysAgo(4),
        description:
          "Wrote a detailed overview of key considerations when migrating between ERP systems.",
      },
      {
        activityType: "Discussion Participation",
        space: "Finance Workflows",
        date: daysAgo(13),
        description:
          "Participated in a discussion on automating month-end reconciliations using system integrations.",
      },
      {
        activityType: "Reply",
        space: "Tools & Systems",
        date: daysAgo(25),
        description:
          "Replied to a question about selecting the right finance systems stack for a growing company.",
      },
    ],
  },

  // ─── AT RISK (no meaningful activity for 15–30 days) ─────────────────────
  {
    name: "Rahul Mehta",
    role: "Finance Controller",
    company: "Apex Retail Systems",
    email: "rahul.mehta@apexretail.example",
    joinedDate: daysAgo(95),
    owner: "Sarah Bennett",
    nextAction: "Check in with a relevant discussion link",
    notes:
      "Was highly engaged in Finance Workflows three months ago. Activity has dropped.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Post",
        space: "Finance Workflows",
        date: daysAgo(20),
        description:
          "Shared a post on improving the financial close process for retail businesses.",
      },
      {
        activityType: "Question",
        space: "Ask Finance Peers",
        date: daysAgo(45),
        description:
          "Asked about handling intercompany eliminations in a multi-entity retail group.",
      },
    ],
  },
  {
    name: "Meera Krishnan",
    role: "Senior Accountant",
    company: "Orbit Manufacturing",
    email: "meera.krishnan@orbit-mfg.example",
    joinedDate: daysAgo(70),
    owner: "Marcus Liu",
    nextAction: "Review history and consider a check-in",
    notes:
      "Engaged earlier in career-related discussions. Last activity was 18 days ago.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Comment",
        space: "Career & Compensation",
        date: daysAgo(18),
        description:
          "Commented on a discussion about professional development paths for accountants in manufacturing.",
      },
      {
        activityType: "Question",
        space: "Ask Finance Peers",
        date: daysAgo(35),
        description:
          "Asked about handling cost accounting for a complex job-order manufacturing environment.",
      },
    ],
  },
  {
    name: "Vikram Joshi",
    role: "Treasury Manager",
    company: "Summit Industries",
    email: "vikram.joshi@summitindustries.example",
    joinedDate: daysAgo(100),
    owner: "Sarah Bennett",
    nextAction: "Flag for human review before re-engagement",
    notes:
      "Knowledgeable on treasury topics. Has not been active in about 3 weeks.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Post",
        space: "Finance Workflows",
        date: daysAgo(23),
        description:
          "Posted about cash flow forecasting methodologies used in capital-intensive industries.",
      },
      {
        activityType: "Reply",
        space: "Tools & Systems",
        date: daysAgo(50),
        description:
          "Replied to a thread about treasury management platform comparisons.",
      },
    ],
  },

  // ─── DORMANT (no meaningful activity for more than 30 days) ──────────────
  {
    name: "Arjun Shah",
    role: "CFO",
    company: "Vertex Business Solutions",
    email: "arjun.shah@vertexbiz.example",
    joinedDate: daysAgo(150),
    owner: "Marcus Liu",
    nextAction: "Review member history before any action",
    notes:
      "Senior member. Contributed significantly to strategic finance discussions early on. Now dormant.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Discussion Participation",
        space: "Interviews & Stories",
        date: daysAgo(55),
        description:
          "Shared insights in a CFO roundtable discussion on managing finance through business growth phases.",
      },
      {
        activityType: "Post",
        space: "Finance Workflows",
        date: daysAgo(80),
        description:
          "Wrote a post on aligning finance strategy with business unit objectives in a multi-division company.",
      },
    ],
  },
  {
    name: "Neha Iyer",
    role: "AP Manager",
    company: "FinBridge Operations",
    email: "neha.iyer@finbridge.example",
    joinedDate: daysAgo(110),
    owner: "Sarah Bennett",
    nextAction: "Review history before deciding on re-engagement",
    notes:
      "Was active in AP-related discussions. Last engaged over 40 days ago.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Question",
        space: "Finance Workflows",
        date: daysAgo(42),
        description:
          "Asked about streamlining three-way matching in a high-volume AP environment.",
      },
      {
        activityType: "Comment",
        space: "Tools & Systems",
        date: daysAgo(65),
        description:
          "Commented on a discussion about AP automation tools and invoice processing platforms.",
      },
    ],
  },
  {
    name: "Divya Rao",
    role: "Financial Controller",
    company: "Greenfield Logistics",
    email: "divya.rao@greenfieldlogistics.example",
    joinedDate: daysAgo(130),
    owner: "Marcus Liu",
    nextAction: "No immediate action — review history first",
    notes:
      "Controller at a logistics firm. Was active about 5 months ago. Last activity over 50 days ago.",
    commercialSignal: "Not assessed",
    activities: [
      {
        activityType: "Post",
        space: "Finance Workflows",
        date: daysAgo(52),
        description:
          "Posted about managing financial reporting complexity in multi-site logistics operations.",
      },
      {
        activityType: "Resource Interaction",
        space: "Tools & Systems",
        date: daysAgo(75),
        description:
          "Interacted with a shared resource on financial controls frameworks for logistics companies.",
      },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Member.deleteMany({});
    console.log("🗑️  Cleared existing member records");

    // Insert fictional demo data
    const inserted = await Member.insertMany(members);
    console.log(`✅ Inserted ${inserted.length} fictional demo members`);

    // Print summary
    console.log("\n📊 Seed data summary:");
    inserted.forEach((m) => {
      console.log(
        `  • ${m.name} (${m.role}) — State: ${m.computedActivityState}`,
      );
    });

    console.log(
      "\n✅ Seeding complete. All data is fictional and for academic demonstration only.",
    );
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
