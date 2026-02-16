ASR Lab — Architecture
1. Core Principle

The entire system runs from a single immutable snapshot:

lab-state.json

If all external services fail, the UI must still render completely from this file alone.

The UI never computes business logic.
All derived fields are computed offline during ingestion.

2. System Model
2.1 Single Source of Truth

lab-state.json contains:

Raw entities (projects, timeline events, tools, notes)

Derived fields (health scores, focus score, activity level)

Metadata (generation time, system health)

No external API calls are allowed from the frontend.

3. Data Model
3.1 Top-Level Structure
{
  "meta": {},
  "derived": {},
  "projects": [],
  "timeline_index": [],
  "timeline_events": {},
  "tools": [],
  "notes": []
}

4. Timeline Architecture
4.1 Timeline is a First-Class Entity

Timeline is NOT nested inside projects.

Instead:

timeline_events = object keyed by event_id

timeline_index = ordered array of event_ids (sorted desc)

Each event contains project_id

Each project contains a list of timeline_event_ids

This enables:

O(1) global feed rendering

Easy filtering

No flattening logic

Clear ownership model

4.2 Timeline Event Structure
{
  "id": "uuid",
  "project_id": "string",
  "type": "decision | milestone | ship | incident | pulse",
  "date": "ISO-8601",
  "title": "string",
  "details": {},
  "source": "manual | git | deploy | system",
  "derived": {
    "summary_text": "string",
    "impact_score": "number"
  }
}

5. Health Score (Structured, Explainable)

Health is not a number.

It is a structured object:

{
  "score": 72,
  "previous_score": 81,
  "last_calculated_at": "ISO-8601",
  "breakdown": {
    "activity": 30,
    "delivery": 20,
    "stability": 12,
    "decision_velocity": 10
  },
  "change_reason": "No deployment in last 10 days"
}


Each project stores this object.

The UI never calculates health.

6. Focus System
6.1 Commits Are Raw Signals Only

Commits are never shown individually.

They contribute only to aggregated Pulse events.

Example Pulse:

{
  "type": "pulse",
  "details": {
    "commit_count": 18,
    "lines_changed": 240
  }
}


Pulse events are generated only if thresholds are met.

6.2 Focus Score (Derived Field)

Each project contains:

{
  "derived": {
    "focus_score": 42,
    "activity_level": "high",
    "last_decision_date": "ISO-8601"
  }
}


Focus score rules:

Decisions weighted highest

Ships next

Pulse activity lowest

7-day rolling window

Recency decay applied

Tie breaker: most recent decision

Threshold required or focus = null

Top-level:

"derived": {
  "current_focus_project_id": "string",
  "global_health": 68
}

7. Derived Fields (Explicit List)

These MUST exist in the snapshot:

For each project:

focus_score

activity_level

last_decision_date

last_event_date

health.score

health.previous_score

health.change_reason

For timeline events:

summary_text

impact_score

Global:

current_focus_project_id

global_health

No derived logic exists in frontend.

8. Ingestion Architecture
8.1 Snapshot Engine

Single stateless process.

Steps:

Acquire lock

Fetch previous snapshot

Pull git activity

Pull deployment events

Parse manual decision files

Normalize raw signals

Generate pulse events

Recalculate health

Recalculate focus

Rebuild timeline_index

Compute all derived fields

Write new snapshot atomically

Release lock

Atomic write rule:

Write to temp file

Replace original only after success

9. Update Cycle

Triggers:

Scheduled every 6 hours

Git push webhook

Manual trigger

Concurrency rule:

Single writer lock

Deduplicate overlapping triggers

Queue if already running

10. Failure Behavior

Principle:

Stale > Broken

If ingestion fails:

Do not overwrite snapshot

meta.system_health = "degraded"

UI reads last valid state

If git fails:

Skip pulse generation

Preserve last metrics

If health computation fails:

Keep previous health object

Log error

Mark degraded

11. Architecture Rules

UI only reads snapshot

UI performs zero business computation

Timeline is indexed top-level entity

Health is structured and explainable

Commits are internal signals only

All derived fields computed offline

Snapshot writes are atomic

Focus is determined mathematically

No runtime dependency on external APIs

12. System Identity

This is not a portfolio.

It is a state machine rendered as a lab.

Every visible change must correspond to:

A decision

A delivery

A measurable activity shift

If it cannot be derived from data, it does not belong in the system.