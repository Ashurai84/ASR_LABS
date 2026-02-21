
import { PulseSummary } from '../ingestion/pulse-aggregator';
import { Project, GlobalDerived } from '../schemas/lab-state';
import { differenceInDays, parseISO } from 'date-fns';

export interface FocusInput {
    projects: ProjectWithPulses[];
    previousState?: GlobalDerived; // To check inertia
    manualOverrideProjectId?: string;
    previousFocusStart?: string; // Need to track this somewhere, keeping it in GlobalDerived is best
}

export interface ProjectWithPulses extends Project {
    recentPulses: PulseSummary[];
}

export interface FocusResult {
    currentFocusId: string | null;
    focusScore: number;
    activityLevel: 'high' | 'medium' | 'low' | 'idle';
    tenureStart?: string; // Return the start date to persist it
}

export interface FocusComputeResponse {
    projects: Record<string, ProjectResult>;
    global: FocusResult;
}

const CONSTANTS = {
    WEIGHT_COMMIT: 10,
    WEIGHT_DEPLOY: 50,
    WEIGHT_MANUAL: 30,
    WEIGHT_HEALTH_DELTA: 5, // Points per unit of health increase

    THRESHOLD_SWAP: 15, // New project must be 15 points higher to steal focus
    MIN_TENURE_DAYS: 3,
    MANUAL_BOOST: 100, // Massive boost for manual override

    DECAY_WINDOW: 7, // days
};

export class FocusCalculator {

    compute(input: FocusInput): FocusComputeResponse {
        const projectResults: Record<string, ProjectResult> = {};
        let maxScore = -1;
        let maxProjectId: string | null = null;

        // 1. Calculate Raw Scores for all projects
        for (const p of input.projects) {
            const score = this.calculateRawScore(p, input.manualOverrideProjectId === p.id);

            let level: 'high' | 'medium' | 'low' | 'idle' = 'idle';
            if (score > 80) level = 'high';
            else if (score > 40) level = 'medium';
            else if (score > 10) level = 'low';

            projectResults[p.id] = {
                projectId: p.id,
                score,
                activityLevel: level
            };

            if (score > maxScore) {
                maxScore = score;
                maxProjectId = p.id;
            }
        }

        // 2. Determine Global Focus (Stabilization Logic)
        let currentFocusId = input.previousState?.current_focus_project_id || null;
        let tenureStart = input.previousFocusStart || new Date().toISOString();
        // If we don't have a start date recorded, we assume now. 
        // In a real persist scenario, we'd need to read this from a robust source.
        // For now, if the focus doesn't change, we keep the old date.

        // If we have a current focus, check if we should swap
        if (currentFocusId && maxProjectId && maxProjectId !== currentFocusId) {
            const currentProjectScore = projectResults[currentFocusId]?.score || 0;
            const contenderScore = maxScore;

            const daysTenure = differenceInDays(new Date(), parseISO(tenureStart));

            let swap = false;

            // Rule 1: Min Tenure
            if (daysTenure < CONSTANTS.MIN_TENURE_DAYS) {
                swap = false; // Too new to switch
            }
            // Rule 2: Swapping Threshold
            else if (contenderScore > (currentProjectScore + CONSTANTS.THRESHOLD_SWAP)) {
                swap = true;
            }

            if (swap) {
                currentFocusId = maxProjectId;
                tenureStart = new Date().toISOString(); // Reset tenure
            }
            // If not swap, we keep currentFocusId
        } else if (!currentFocusId && maxProjectId) {
            // No current focus, just take the winner
            if (maxScore > 20) { // Minimum activation energy
                currentFocusId = maxProjectId;
                tenureStart = new Date().toISOString();
            }
        } else if (currentFocusId && maxProjectId && maxProjectId === currentFocusId) {
            // Same focus, just update
        }

        // If the score drops too low, we might lose focus entirely?
        // Architecture says: "If S_max < 20, Focus = None".
        if (currentFocusId && projectResults[currentFocusId].score < 20) {
            currentFocusId = null;
        }

        return {
            projects: projectResults,
            global: {
                currentFocusId,
                focusScore: currentFocusId ? projectResults[currentFocusId].score : 0,
                activityLevel: currentFocusId ? projectResults[currentFocusId].activityLevel : 'idle',
                tenureStart
            }
        };
    }

    private calculateRawScore(p: ProjectWithPulses, isManualOverride: boolean): number {
        let score = 0;
        const now = new Date();

        // A. Pulse Activity (Decayed)
        // We sum up weighted pulses from the last 7 days
        for (const pulse of p.recentPulses) {
            const daysAgo = differenceInDays(now, parseISO(pulse.date));
            if (daysAgo >= CONSTANTS.DECAY_WINDOW) continue;

            const decayFactor = 1 / (daysAgo + 1);

            // Points for commits
            // Note: Architecture says W_c * Sum(C). 
            // Is it Sum(W_c * C) with decay per day? Yes ("Recency decay applied").
            // So (CommitCount * W_c) * Decay
            const dailyScore = (pulse.commitCount * CONSTANTS.WEIGHT_COMMIT); // + lines changes factor?
            score += (dailyScore * decayFactor);
        }

        // B. Delivery & Decisions (Recency based)
        // We don't have discrete events here easily unless we look at the raw timeline or project derived fields.
        // The Project input has `last_decision_date` etc.
        // Let's rely on recent events if we had them passed in, but sticking to the requested `FocusInput` 
        // which relies on `ProjectWithPulses`. 
        // I should probably pass timeline events or use the `last_x_date` from project to estimate.
        // Better: Iterate the project's timeline_events if available. 
        // Architecture: "Timeline entries belong to projects". The Project structure in memory should have them.
        // Let's assume we can access them. 
        // For this implementation, I will stick to what I have in `ProjectWithPulses` or calculate from `last_decision_date`.

        // Simplification: Check last_decision_date. If within 7 days, add points decayed.
        if (p.derived?.last_decision_date) {
            const dDays = differenceInDays(now, parseISO(p.derived.last_decision_date));
            if (dDays < 7) {
                score += (CONSTANTS.WEIGHT_MANUAL * (1 / (dDays + 1)));
            }
        }

        // C. Health Delta
        // If health improved, add points.
        if (p.health && p.health.previous_score) {
            const delta = p.health.score - p.health.previous_score;
            if (delta > 0) {
                score += (delta * CONSTANTS.WEIGHT_HEALTH_DELTA);
            }
        }

        // D. Manual Override
        if (isManualOverride) {
            score += CONSTANTS.MANUAL_BOOST;
        }

        return Math.round(score);
    }
}

interface ProjectResult {
    projectId: string;
    score: number;
    activityLevel: 'high' | 'medium' | 'low' | 'idle';
}
