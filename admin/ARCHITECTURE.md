# Admin Workspace Architecture

## 1. Workspace Hierarchy

The Admin Console is a flat, two-pane application designed for focus.

- **Sidebar (Navigation)**
  - **Inbox**: Quick capture for thoughts/drafts.
  - **Projects**: List of active/archived projects.
  - **Journal**: Chronological stream of decisions (Timeline).
  - **Notes**: Long-form engineering essays.
  - **Tools**: Catalog of software artifacts.
  - **Profile**: Global metadata (Bio, Links, Avatar).
  - **System**: Trigger manual build/deploy.

- **Main Canvas (Editor)**
  - Context-aware editor based on selection.
  - **Project View**: Form fields (Name, Repo) + Markdown Description.
  - **Journal View**: Structured fields (Rationale, Outcome) + Timeline placement.
  - **Note View**: Full-screen Markdown editor.

## 2. Data Model (Source of Truth)

Content is stored in human-readable local files within `admin/content/`.

### A. Projects (`content/projects.yaml`)
```yaml
- id: asr-lab
  name: ASR Lab
  status: build (idea | build | shipped)
  repo: https://github.com/...
  tags: [typescript, react]
  description: "A living engineering journal."
```

### B. Journal (`content/timeline.yaml`)
```yaml
- id: uuid-v4
  date: ISO-8601
  type: decision (decision | ship | pulse)
  project_id: asr-lab
  title: "Migrated to Tailwind v4"
  details:
    rationale: "Performance improvements..."
    outcome: "Build time reduced by 40%."
```

### C. Notes (`content/notes/*.md`)
Markdown files with Frontmatter.
```markdown
---
id: architecture-v1
title: "The Case for Static State"
date: 2026-02-16
tags: [architecture, perf]
---
# Content...
```

### D. Profile (`content/profile.yaml`)
```yaml
name: Ashutosh Rai
bio: "Senior Systems Engineer."
links:
  github: ...
  twitter: ...
```

## 3. Publishing Workflow

1.  **Draft**: Admin writes in the UI. Autosave writes to `admin/content/*.yaml`.
2.  **Preview**: The Admin UI reflects changes immediately (local state).
3.  **Publish**: Clicking "Ship to Lab" triggers `npm run ingest` in `backend/`.
    - This reads `admin/content/*` + Git History.
    - Aggregates data.
    - Generates `lab-state.json`.
4.  **Deploy**: The GitHub Action (Daily Pulse) or manual push deploys the new `lab-state.json` to the public site.

## 4. Component Responsibilities

- **`Store` (Backend API)**:
  - `GET /api/*`: Reads YAML/MD files.
  - `POST /api/*`: Writes YAML/MD files (atomic saves).
  - `POST /api/publish`: Runs the ingestion scripts.

- **`EditorShell` (UI)**:
  - Manages "dirty" state (unsaved changes).
  - Handles keyboard shortcuts (Cmd+S to save).

- **`BlockEditor`**:
  - A minimal textarea that auto-expands.
  - Supports markdown syntax highlighting (optional).
