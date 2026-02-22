export type SignalSource = 'git' | 'manual' | 'deploy';

export interface RawSignal {
    id: string; // Deterministic ID (e.g., commit hash, or manual-event-uuid)
    projectId: string; // The slug of the project this signal belongs to
    source: SignalSource;
    timestamp: string; // ISO 8601
    data: Record<string, any>; // The raw payload (commit object, yaml entry, etc.)

    // Minimal metadata for filtering later
    metadata?: {
        isNoise?: boolean;
        category?: string;
    };
}

export interface IngestionSourceAdapter {
    name: string;
    fetchSignals(projectRoot: string, projectId: string): Promise<RawSignal[]>;
}

export interface IngestionConfig {
    projects: {
        id: string;
        path: string; // Local path to repo
        adminPath?: string; // Path to admin config directory if separate from repo path
    }[];
}
