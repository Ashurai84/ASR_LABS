# ASR Lab — Full Project Documentation

> A real-time, self-updating engineering portfolio that tracks your decisions, commits, and projects as they happen.

---

## 📌 What is This?

Most developer portfolios are **dead documents** — you write them once and forget about them. They go out of date the moment you close the editor.

ASR Lab is different.

It is a **living engineering journal** that automatically reads your actual Git commits, picks up the notes and decisions you write yourself, and combines them into a beautiful, real-time public portfolio website.

**You don't manually update it. It keeps itself updated.**

---

## 🏗️ How the System is Built

The project is split into **3 separate applications** that work together:

```
Portfolio/
├── frontend/      → The public website visitors see
├── backend/       → The ingestion engine (data pipeline)
├── admin/         → Your private dashboard to manage content
└── .github/       → Automation workflows (GitHub Actions)
```

---

## 1. Frontend (`/frontend`)

**What it is:** A React + TypeScript + Vite web application.

**What it does:** Displays your portfolio to the public. It reads **one single file** — `frontend/public/data/lab-state.json` — and renders everything from it: projects, timelines, health scores, decisions, notes, and artifacts.

**Why it works this way:**
- The frontend is a "dumb" renderer. It doesn't connect to any database.
- Since all data lives in a single JSON file, the site is **extremely fast** and can be deployed to any free hosting platform like Vercel or Netlify.
- There is no backend server needed to serve the live website.

**Key pages:**
| Route | What it shows |
|---|---|
| `/` | Dashboard with health score, current focus, journal |
| `/projects/:id` | Full case study page for a single project |
| `/journal` | Full chronological engineering timeline |
| `/notes` | Engineering notes and logs |
| `/artifacts` | Tools, certifications, links showcase |

---

## 2. Backend — The Ingestion Engine (`/backend`)

**What it is:** A Node.js + TypeScript script. Not a web server — a **pipeline** you run manually or automatically.

**What it does:** Scans all your project sources, aggregates raw signals, computes metrics, and writes the final `lab-state.json` file that the frontend reads.

**How to run it:**
```bash
cd backend
npm run ingest
```

**The pipeline has 7 steps:**

```
Step 1: Discover projects   → Reads admin/content/projects/ to find what to scan
Step 2: Fetch signals       → Asks adapters to pull raw data (commits, manual entries)
Step 3: Aggregate pulses    → Groups raw commits into daily "pulse" summaries
Step 4: Apply moderation    → Removes any days you've hidden in the Admin Panel
Step 5: Compute health      → Calculates the health score for each project
Step 6: Compute focus       → Decides which project you're currently most focused on
Step 7: Write snapshot      → Saves the final JSON file to frontend/public/data/
```

**The Adapters:**

The engine uses "adapters" — plug-ins that fetch data from different sources:

| Adapter | What it fetches |
|---|---|
| `GitHubAdapter` | Fetches commits from GitHub API |
| `AdminAdapter` | Reads your manual timeline entries from `.md` files |

**The Health Score:**

Each project gets a score based on 4 factors:
- **Activity (25%)** — How many commits recently?
- **Delivery (25%)** — Have you shipped anything recently?
- **Stability (25%)** — Did you write any decisions?
- **Decision Velocity (25%)** — How regularly do you make recorded decisions?

---

## 3. Admin Panel (`/admin`)

**What it is:** A local React web app with its own Express server. It runs at `http://localhost:5173` and is **never deployed publicly**.

**What it does:** A private control center for managing all your portfolio content without touching raw files.

**How to run it:**
```bash
cd admin
npm run dev
```

**What you can do inside it:**
- ✅ Create, edit, or delete projects
- ✅ Write and manage manual timeline entries (decisions, ships, discoveries)
- ✅ Fill in case study details (cover image, my role, tech stack, contributions, gallery)
- ✅ Hide/Show automated Git commit days from the public frontend
- ✅ Manage your tools, certifications, and profile bio
- ✅ Click "Save & Publish" to instantly run ingestion and update the frontend

**How it saves data:**

When you save a project, the Admin writes files to `admin/content/`:
```
admin/content/
├── projects/
│   └── asr-lab/
│       ├── project.md          ← Name, status, GitHub URL, published flag
│       ├── timeline.md         ← Your manual journal entries
│       ├── pulse-moderation.json ← Which commit days you've hidden
│       └── asr-lab.json        ← Case study data (images, tech stack, etc.)
├── notes/                      ← Your engineering notes (.md files)
├── tools.json                  ← Tools, certifications, and links
└── profile.md                  ← Your name, bio, and social links
```

---

## 4. Automation — GitHub Actions (`/.github/workflows/`)

**What it is:** A "robot" that runs in the cloud on GitHub's servers.

**Why you need it:** Without automation, your portfolio only updates when you manually run `npm run ingest` on your laptop. With automation, it updates itself every day — even while you sleep.

**How it works:**

**Trigger → Run → Detect changes → Commit → Vercel rebuilds**

1. A timer fires every night (or you push code).
2. GitHub spins up a cloud server.
3. It checks out your repository.
4. It runs `npm run ingest`.
5. If `lab-state.json` changed, it commits and pushes it back.
6. That push triggers Vercel to rebuild your public website with the fresh data.

**The files:**
| File | Purpose |
|---|---|
| `.github/workflows/ingest.yml` | Main daily data pipeline |
| `.github/workflows/daily-pulse.yml` | (Additional/secondary pipeline if present) |

---

## 🔄 The Full Workflow

Here is what happens end-to-end when you work on a project:

```
You write code
      ↓
You push commits to GitHub
      ↓
GitHub Action triggers automatically
      ↓
Ingestion engine scans your commits
      ↓
Generates new lab-state.json
      ↓
Commits it back to GitHub
      ↓
Vercel detects the new commit
      ↓
Rebuilds and deploys your live website
      ↓
Visitors see your updated timeline ✅
```

---

## 🚀 How to Add a New Project

1. Open the Admin Panel (`localhost:5173`).
2. Click **"+ New Project"**.
3. Fill in the name, status, GitHub URL, and description.
4. Optionally write timeline entries in the "Journal" tab.
5. Fill in case study details.
6. Toggle the project to **"Published"**.
7. Click **"Save & Publish"**.

The new project will appear on your live website automatically.

---

## 🔧 Local Development Setup

To run the full system locally, you need **3 terminals**:

**Terminal 1 — Frontend:**
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5174
```

**Terminal 2 — Admin Panel:**
```bash
cd admin
npm install
npm run dev
# Opens at http://localhost:5173
```

**Terminal 3 — Update Data (run when needed):**
```bash
cd backend
npm install
npm run ingest
```

---

## 🌐 Hosting & Deployment

| Part | Where it lives | Auto-updated? |
|---|---|---|
| Frontend | Vercel (or Netlify) | ✅ Yes — on every push |
| Backend/Ingestion | GitHub Actions (cloud) | ✅ Yes — automatically daily |
| Admin Panel | Your laptop only | ❌ Never deployed publicly |

**To deploy the frontend:**
1. Go to [vercel.com](https://vercel.com) → Add New Project.
2. Connect your `ASR_LABS` GitHub repository.
3. Set Root Directory to `frontend`.
4. Click Deploy. Done.

---

## 🗄️ The Data File — `lab-state.json`

This is the single source of truth for the entire frontend. Every time ingestion runs, this file is completely rewritten.

**Structure:**
```json
{
  "meta": { "generated_at": "...", "version": "1.1" },
  "derived": { "current_focus_project_id": "asr-lab", "global_health": 100 },
  "projects": [ { "id": "...", "name": "...", "health": {...}, ... } ],
  "timeline_index": [ "uuid1", "uuid2", ... ],
  "timeline_events": { "uuid1": { "type": "decision", ... }, ... }
}
```

---

## 🔑 Common Commands

```bash
# Update portfolio data manually
cd backend && npm run ingest

# Push local changes to GitHub
git add .
git commit -m "your message"
git pull --rebase   # Always do this first if the robot has been running!
git push

# Run full local dev environment
cd admin && npm run dev    # Terminal 1
cd frontend && npm run dev # Terminal 2
```

---

## ❓ FAQ

**Q: Why do I get rejected when I do `git push`?**
A: The GitHub Action robot probably committed new data while you weren't looking. Run `git pull --rebase` first, then `git push`.

**Q: I hid a day in the Admin Panel but it's still showing on the frontend.**
A: You need to click "Save & Publish" after hiding it. Hiding alone just saves the preference; publishing runs the ingestion engine that removes it from the data.

**Q: Can I add a project that's on my laptop and not on GitHub?**
A: Yes! Set the `local_path` in your `project.md` to point to the folder. The Git adapter will scan it locally.

**Q: Is the Admin Panel secure to deploy?**
A: No. It has no authentication. Keep it local-only on your machine. Never deploy it to a hosting platform.
