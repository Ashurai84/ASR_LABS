export type ISODateString = string;
export type UUID = string;
export type ProjectID = string; // slug

export type SystemHealth = 'operational' | 'degraded';

// --- Top Level ---

export interface LabState {
  meta: Meta;
  derived: GlobalDerived;
  projects: Project[];
  timeline_index: UUID[];
  timeline_events: Record<UUID, TimelineEvent>;
  tools: Tool[];
  notes: Note[];
}

export interface Meta {
  generated_at: ISODateString;
  version: string;
  system_health: SystemHealth;
}

export interface GlobalDerived {
  current_focus_project_id: ProjectID | null;
  global_health: number;
}

// --- Project ---

export type ProjectStatus = 'idea' | 'build' | 'shipped' | 'paused';

export interface Project {
  id: ProjectID;
  name: string;
  description: string;
  status: ProjectStatus;
  repository_url?: string;
  tags: string[];
  derived: ProjectDerived;
  // Note: projects contain timeline_event_ids for local rendering, but global timeline_index is authoritative for the feed.
  timeline_event_ids: UUID[];
  
  // Health is stored in derived, or at top level? Architecture says "Each project stores this object".
  // Architecture "Derived Fields (Explicit List)" says:
  // For each project: focus_score, activity_level, last_decision_date, last_event_date, health.score, health.previous_score, health.change_reason.
  // Health "Structured Object" section says: "Each project stores this object."
  health: HealthScore;
}

export interface ProjectDerived {
  focus_score: number;
  activity_level: 'high' | 'medium' | 'low' | 'idle';
  last_decision_date: ISODateString;
  last_event_date: ISODateString;
}

// --- Health ---

export interface HealthScore {
  score: number;
  previous_score: number;
  last_calculated_at: ISODateString;
  breakdown: {
    activity: number;
    delivery: number;
    stability: number;
    decision_velocity: number;
  };
  change_reason: string;
}

// --- Timeline ---

export type EventType = 'decision' | 'milestone' | 'ship' | 'incident' | 'pulse';
export type EventSource = 'manual' | 'git' | 'deploy' | 'system';

export interface TimelineEvent {
  id: UUID;
  project_id: ProjectID;
  type: EventType;
  date: ISODateString;
  title: string;
  details: Record<string, any>; // Flexible details based on type
  source: EventSource;
  derived: EventDerived;
}

export interface EventDerived {
  summary_text: string;
  impact_score: number;
}

export interface PulseDetails {
  commit_count: number;
  lines_changed: number;
}

// --- Other Entities ---

export interface Tool {
  name: string;
  category: string;
  proficiency: number; // 0-10
}

export interface Note {
  id: string;
  title: string;
  date: ISODateString;
  content_markdown: string;
  related_project_id?: ProjectID;
}
