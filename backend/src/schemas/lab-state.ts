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
  profile: any;
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

export interface ProjectImage {
  url: string;
  caption?: string;
  type?: 'screenshot' | 'diagram' | 'photo';
}

export interface Project {
  id: ProjectID;
  name: string;
  description: string;
  status: ProjectStatus;
  repository_url?: string;
  tags: string[];
  derived: ProjectDerived;
  timeline_event_ids: UUID[];
  health: HealthScore;

  // === Case Study Fields (optional) ===
  cover_image?: string;         // Hero banner URL
  images?: ProjectImage[];      // Gallery (up to 5+)
  my_role?: string;             // e.g. "Lead Fullstack Engineer"
  contributions?: string[];     // Bullet point list
  tech_stack?: {
    frontend?: string[];
    backend?: string[];
    devops?: string[];
    other?: string[];
  };
  links?: {
    github?: string;
    demo?: string;
    docs?: string;
  };
  outcome?: string;             // One-line impact/result
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
  id: string;
  name: string;
  slug?: string;
  type?: string;
  status: string;
  version?: string;
  work_context?: any;
  description: string;
  my_role?: any;
  tech_stack?: any;
  tags?: string[];
  metrics?: any;
  links?: any;
  url?: string;
  deprecation?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  title: string;
  date: ISODateString;
  content: string;
  related_project_id?: ProjectID;
}
