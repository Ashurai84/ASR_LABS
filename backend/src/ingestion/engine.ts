import { GitAdapter } from './adapters/git';
import { ManualAdapter } from './adapters/manual';
import { AdminAdapter } from './adapters/admin';
import { IngestionConfig, RawSignal, IngestionSourceAdapter } from './interfaces';

export class IngestionEngine {
    private adapters: IngestionSourceAdapter[];
    private config: IngestionConfig;

    constructor(config: IngestionConfig) {
        this.config = config;
        this.adapters = [
            new GitAdapter(),
            new ManualAdapter(),
            new AdminAdapter(),
        ];
    }

    async fetchAllSignals(): Promise<RawSignal[]> {
        const allSignals: RawSignal[] = [];

        // Iterate over projects first, then adapters?
        // Or run adapters in parallel for all projects?
        // Parallel per project is safer for isolation.

        const projectPromises = this.config.projects.map(async (project) => {
            const projectSignals: RawSignal[] = [];

            for (const adapter of this.adapters) {
                try {
                    // fetchSignals might fail for one adapter but others should succeed
                    const signals = await adapter.fetchSignals(project.path, project.id);
                    projectSignals.push(...signals);
                } catch (e) {
                    console.error(`ERROR: Adapter ${adapter.name} failed for project ${project.id}:`, e);
                    // Don't throw, just log and continue (partial data > no data)
                }
            }

            return projectSignals;
        });

        const results = await Promise.all(projectPromises);
        return results.flat();
    }
}
