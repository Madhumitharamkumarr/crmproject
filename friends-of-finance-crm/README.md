# Friends of Finance Community Activity CRM

> **Academic Assignment Project**
> All data in this application is fictional and created for academic demonstration purposes only.
> No real people's information is used. No real Friends of Finance activity is represented.

---

## Project Overview

A professional CRM-style dashboard designed for a fictional community manager to track and manage member activity in **Friends of Finance** — a professional community for finance and accounting practitioners.

The application allows a community manager to:

- View a real-time community overview dashboard with KPI cards and charts
- View, add, edit, and search fictional member records
- Record member activities across community spaces
- Automatically classify members by activity state
- Identify members needing follow-up
- Use simulated AI-assisted next-step suggestions (with human review required)

---

## Features

| Feature | Description |
|---|---|
| Dashboard | KPI cards + Chart.js activity state doughnut and bar charts |
| Members Page | Search, filter by state/space/owner, Add/Edit members |
| Member Detail | Profile, full activity history, add activity, AI suggestion |
| Follow-ups | Grouped view: Dormant → At Risk → Newly Joined |
| Focused Views | Separate pages per state (Newly Joined, Highly Active, At Risk, Dormant) |
| AI Feature | Simulated rule-based suggestions with mandatory safeguards |
| Help Section | Full documentation with testing instructions |
| Commercial Signal | Separate field — never used in activity state or scoring |

---

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js 18+, Express.js
- **Database:** MongoDB + Mongoose
- **Charts:** Chart.js (CDN)
- **Fonts:** Google Fonts (Inter)
- **Deployment:** Render-compatible (listens on `0.0.0.0:PORT`)

---

## Folder Structure

```
friends-of-finance-crm/
│
├── server.js              # Express server + dashboard/followups/focused APIs
├── package.json
├── .env                   # Not committed — see .env.example
├── .env.example
├── .gitignore
│
├── models/
│   └── Member.js          # Mongoose schema with virtual activity state
│
├── routes/
│   └── members.js         # CRUD routes for members and activities
│
├── seed/
│   └── seed.js            # 15 fictional members covering all states
│
└── public/
    ├── index.html          # Dashboard
    ├── members.html        # Members list + add/edit modals
    ├── member.html         # Member detail + add activity + AI suggestion
    ├── followups.html      # Follow-up view
    ├── focused.html        # Shared focused view page
    ├── help.html           # Help & testing
    ├── css/
    │   └── style.css
    └── js/
        ├── shared.js       # Common utilities, sidebar, toast, API helper
        ├── dashboard.js
        ├── members.js
        ├── member.js
        ├── followups.js
        └── focused.js
```

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended for deployment)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account and a free M0 cluster
3. Create a database user with read/write permissions
4. Whitelist `0.0.0.0/0` in Network Access (for Render deployment)
5. Click **Connect → Drivers** and copy your connection string
6. It will look like: `mongodb+srv://username:password@cluster.mongodb.net/fof-crm?retryWrites=true&w=majority`

### Option 2: Local MongoDB

1. Install MongoDB Community Edition
2. Start with: `mongod`
3. Use URI: `mongodb://127.0.0.1:27017/fof-crm`

---

## Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string_here
PORT=3000
```

> ⚠ Never commit your `.env` file. It is listed in `.gitignore`.

---

## How to Run Locally

```bash
# 1. Navigate into the project directory
cd friends-of-finance-crm

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env and add your MONGO_URI

# 4. Seed the database with fictional demo data
npm run seed

# 5. Start the server
npm start

# Visit: http://localhost:3000
```

For development with auto-reload:
```bash
npm run dev
```

---

## Seed Database

The seed script inserts 15 fictional members with activities covering all five activity states.

```bash
npm run seed
```

This will:
1. Clear any existing member records
2. Insert 15 fictional demo members
3. Print a state summary in the terminal

> Dates are set relative to the submission date (August 2026) so all state calculations work correctly.

**Seed data distribution:**
- 2 Newly Joined
- 3 Highly Active
- 3 Active (with some borderline At Risk)
- 3 At Risk
- 2 Dormant (with some additional edge cases)

---

## Activity State Rules

These rules were created for this assignment. They are not official Friends of Finance rules.

| State | Rule |
|---|---|
| **Newly Joined** | Joined within last 7 days (takes priority) |
| **Highly Active** | 5+ meaningful activities in last 14 days |
| **Active** | 2–4 meaningful activities in last 14 days |
| **At Risk** | No meaningful activity for 15–30 days |
| **Dormant** | No meaningful activity for 30+ days |

Activity state is computed dynamically as a Mongoose virtual — it is never stored in the database.
Commercial signals are never used in state calculation.

---

## AI Feature

The **AI Suggested Next Step** feature on the member detail page is **fully simulated** using rule-based JavaScript logic. It does not call any paid external AI API.

The suggestion is generated by analysing:
- Current activity state
- Most active community space
- Recent activity types (questions, posts, etc.)
- Member role

### Safeguards (displayed on every recommendation)

- ✓ AI recommendation is simulated — rule-based logic, not a paid API
- ✓ AI does not send messages automatically — human review always required
- ✓ AI does not invent personalisation or access external data
- ✓ Community activity must NOT be treated as commercial intent
- ✓ AI does not infer buying intent — no member is a sales lead

---

## Testing

Run through all 9 test cases documented in the **Help & Testing** page within the application (`/help.html`).

Quick summary:

1. Add a member → should be Newly Joined
2. Add 5 activities in 14 days → Highly Active
3. Add 2 activities in 14 days → Active
4. Check Rahul Mehta (15–30 days inactive) → At Risk
5. Check Arjun Shah (30+ days inactive) → Dormant
6. Search "Ananya" → only Ananya Rao shown
7. Filter by "Highly Active" → only Highly Active members shown
8. Add an activity → history and state update immediately
9. Click AI suggestion → recommendation displayed with all safeguards

---

## Deployment (Render)

1. Push your code to a GitHub repository (do not commit `.env`)
2. Go to [https://render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repository
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `PORT` = 3000 (or leave blank; Render sets it automatically)
6. Deploy — Render will give you a public URL

The server listens on `0.0.0.0` and uses `process.env.PORT`, making it compatible with Render and similar platforms.

> No login or access request is required. The application opens directly from the public URL.

---

## 5-Minute Demonstration Flow

**Opening (30 sec):**
"This is the Friends of Finance Community CRM — a dashboard for managing fictional community members and their activity. All data is fictional demo data for this academic assignment."

**Dashboard (45 sec):**
Show KPI cards — total members, states. Point out the doughnut and bar charts.

**Members Page (60 sec):**
- Show the table with badges
- Search for "Ananya" — filter works
- Filter by "Highly Active" — state filter works
- Add a new member — show the form and success message

**Member Detail (60 sec):**
- Click on Ananya Rao — show profile and activity history
- Add a new activity — show it appears and state may update
- Click AI Suggested Next Step — show recommendation with safeguards

**Follow-ups (30 sec):**
Show the Follow-ups page — Dormant, At Risk, Newly Joined grouped sections.

**Focused Views (30 sec):**
Click "Highly Active" in sidebar — show the focused view with the commercial-intent disclaimer.

**Help Page (30 sec):**
Open Help — show activity state rules table, AI safeguards, testing instructions.

**Closing (15 sec):**
"The backend is Node.js + Express, database is MongoDB, and the frontend is plain HTML/CSS/JS with no framework. The activity state is calculated dynamically by a Mongoose virtual — never stored. The AI feature is rule-based and simulated."

---

## Data Disclaimer

All member names, companies, roles, email addresses, and activity descriptions are entirely fictional.
Created for academic demonstration purposes only.
Not affiliated with any real organisation.
Commercial intent must not be inferred from any community activity shown.
