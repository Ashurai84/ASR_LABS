
import { RawSignal } from './interfaces';
import { v5 as uuidv5 } from 'uuid';

/**
 * Pulse Event Structure
 * Not exactly matching TimelineEvent yet, but the core data for it.
 */
export interface PulseSummary {
    id: string; // Deterministic ID based on project + date
    projectId: string;
    date: string; // YYYY-MM-DD
    commitCount: number;
    linesChanged: number; // Approximate
    fileCount: number;
}

const PULSE_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

export class PulseAggregator {

    /**
     * Aggregates raw git signals into daily Pulse summaries.
     * Filters noise.
     */
    aggregate(signals: RawSignal[]): PulseSummary[] {
        const pulses: Record<string, PulseSummary> = {};

        for (const signal of signals) {
            if (signal.source !== 'git') continue;
            if (signal.metadata?.isNoise) continue;

            // Group by Day (YYYY-MM-DD)
            const date = new Date(signal.timestamp).toISOString().split('T')[0];
            const key = `${signal.projectId}-${date}`;

            if (!pulses[key]) {
                pulses[key] = {
                    id: uuidv5(key, PULSE_NAMESPACE),
                    projectId: signal.projectId,
                    date: date,
                    commitCount: 0,
                    linesChanged: 0,
                    fileCount: 0
                };
            }

            const summary = pulses[key];
            summary.commitCount++;

            // Lines changed approximation (if available in raw data)
            // simple-git log sometimes gives diff stats, sometimes need separate call per commit
            // For now, we assume simple-git log output might need enrichment or we use a heuristic
            // To keep it simple and performant (one log command), we might not have exact lines here
            // But we can count files if 'diff' or 'changes' is present in raw
            // Let's assume raw data.diff or similar if we enhanced the adapter. 
            // For this MVP, we count commits reliably. Lines changed is bonus.
            // If signal.data.diff exists...
        }

        // Convert map to array
        return Object.values(pulses).filter(p => p.commitCount > 0);
    }
}
