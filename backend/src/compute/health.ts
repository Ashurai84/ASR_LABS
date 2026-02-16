
import { RawSignal } from '../ingestion/interfaces';
import { PulseSummary } from '../ingestion/pulse-aggregator';
import { HealthScore } from '../schemas/lab-state';
import { differenceInDays, parseISO } from 'date-fns';

export interface HealthCalculatorInput {
    projectId: string;
    pulses: PulseSummary[];
    lastShipDate?: string;
    lastDecisionDate?: string;
    previousHealth?: HealthScore;
}

export class HealthCalculator {

    compute(input: HealthCalculatorInput): HealthScore {
        const now = new Date();

        // 1. Calculate Component Scores
        const activityScore = this.calculateActivity(input.pulses, now);
        const deliveryScore = this.calculateDelivery(input.lastShipDate, now);
        const decisionScore = this.calculateDecisionVelocity(input.lastDecisionDate, now);

        // Stability is tricky without deeper analysis. 
        // For now, assume baseline stable (50) + activity penalty if too frantic?
        // Or simpler: Stability = inverse of recent huge changes?
        // Let's stub a simple heuristic: Stable unless updated recently (which might break things).
        // Actually, stability often means "not broken". If we had incident data, we'd use it.
        // Without incidents, let's peg it to a constant or base it on "time since last ship" (maturity).
        const stabilityScore = 80; // Placeholder until we have incident signals

        // 2. Weighted Total
        // Weights: Activity (30%), Delivery (30%), Decision (20%), Stability (20%)
        const weightedScore = Math.round(
            (activityScore * 0.3) +
            (deliveryScore * 0.3) +
            (decisionScore * 0.2) +
            (stabilityScore * 0.2)
        );

        // 3. Determine Change Reason
        let changeReason = "Routine update";
        if (input.previousHealth) {
            if (weightedScore > input.previousHealth.score) {
                if (activityScore > input.previousHealth.breakdown.activity) changeReason = "Increased development activity";
                else if (deliveryScore > input.previousHealth.breakdown.delivery) changeReason = "Recent deployment";
                else if (decisionScore > input.previousHealth.breakdown.decision_velocity) changeReason = "New architectural decisions";
            } else if (weightedScore < input.previousHealth.score) {
                if (deliveryScore < input.previousHealth.breakdown.delivery) changeReason = "No recent shipments";
                else if (activityScore < input.previousHealth.breakdown.activity) changeReason = "Decreased activity";
            }
        }

        return {
            score: weightedScore,
            previous_score: input.previousHealth ? input.previousHealth.score : weightedScore,
            last_calculated_at: now.toISOString(),
            breakdown: {
                activity: activityScore,
                delivery: deliveryScore,
                stability: stabilityScore,
                decision_velocity: decisionScore
            },
            change_reason: changeReason
        };
    }

    private calculateActivity(pulses: PulseSummary[], now: Date): number {
        // Look at last 14 days
        // Max score if > 5 active days or > 50 commits
        let commitCount = 0;
        let activeDays = 0;

        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);

        for (const p of pulses) {
            const pDate = parseISO(p.date);
            if (pDate >= twoWeeksAgo) {
                commitCount += p.commitCount;
                activeDays++;
            }
        }

        if (activeDays >= 5 || commitCount >= 50) return 100;
        if (activeDays >= 3 || commitCount >= 20) return 75;
        if (activeDays >= 1 || commitCount >= 5) return 50;
        return 0; // Dormant
    }

    private calculateDelivery(lastShipDate: string | undefined, now: Date): number {
        if (!lastShipDate) return 0;

        const daysSince = differenceInDays(now, parseISO(lastShipDate));

        if (daysSince <= 7) return 100; // Shipped this week
        if (daysSince <= 14) return 80;
        if (daysSince <= 30) return 60;
        if (daysSince <= 90) return 40;
        return 20; // Long time no ship
    }

    private calculateDecisionVelocity(lastDecisionDate: string | undefined, now: Date): number {
        if (!lastDecisionDate) return 0;

        const daysSince = differenceInDays(now, parseISO(lastDecisionDate));

        if (daysSince <= 14) return 100; // Fresh thinking
        if (daysSince <= 30) return 80;
        if (daysSince <= 60) return 50;
        return 20; // Stale architecture?
    }
}
