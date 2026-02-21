export type ISODateString = string;
export type UUID = string;
export type ProjectID = string;

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
    profile: Profile;
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
    cover_image?: string;
    images?: ProjectImage[];
    my_role?: string;
    contributions?: string[];
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
    outcome?: string;
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
    details: Record<string, any>;
    source: EventSource;
    derived: EventDerived;
}

export interface EventDerived {
    summary_text: string;
    impact_score: number;
}

// --- Other Entities ---

export type ToolStatus = 'ACTIVE' | 'EXPERIMENTAL' | 'DEPRECATED' | 'ARCHIVED' | string;
export type ToolType = 'BACKEND' | 'FRONTEND' | 'FULLSTACK' | 'DEVOPS' | 'MOBILE' | 'AI_ML' | string;

export interface Tool {
    id: string;
    name: string;
    slug?: string;

    // Classification
    type?: ToolType;
    status: ToolStatus;
    version?: string;

    // Work context
    work_context?: {
        company?: string;
        team?: string;
        timeline?: string;
    };

    // Description
    description: string;

    // Your role
    my_role?: {
        title?: string;
        contributions?: string[];
    };

    // Technical details
    tech_stack?: {
        frontend?: string[];
        backend?: string[];
        devops?: string[];
        other?: string[];
    };
    tags?: string[]; // Legacy support

    // Metrics
    metrics?: {
        lines_of_code?: number;
        users?: string;
        performance?: string;
        team_size?: number;
    };

    // Links
    links?: {
        github?: string;
        demo?: string;
        docs?: string;
        case_study?: string;
    };
    url?: string; // Legacy support

    // Deprecation info
    deprecation?: {
        reason: string;
        date: string;
        replacement?: string;
        lessons_learned?: string;
    };

    // Timestamps
    created_at?: string;
    updated_at?: string;
}

export interface Note {
    id: string;
    slug?: string;
    title: string;
    date: ISODateString;
    content: string;
    excerpt?: string;
    tags?: string[];
    related_project_id?: ProjectID;
}

export interface Profile {
    name: string;
    bio: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
}
