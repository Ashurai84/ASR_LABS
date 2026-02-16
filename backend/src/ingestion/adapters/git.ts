import simpleGit, { SimpleGit } from 'simple-git';
import { IngestionSourceAdapter, RawSignal } from '../interfaces';

export class GitAdapter implements IngestionSourceAdapter {
    name = 'git';

    async fetchSignals(projectRoot: string, projectId: string): Promise<RawSignal[]> {
        const git: SimpleGit = simpleGit(projectRoot);

        // Check if it is a repo
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            console.warn(`WARNING: ${projectRoot} is not a git repository. Skipping git ingestion.`);
            return [];
        }

        // Fetch log
        // We fetch everything. filtering happens later in the normalization/aggregation phase.
        const log = await git.log();

        return log.all.map(commit => ({
            id: commit.hash,
            projectId: projectId,
            source: 'git',
            timestamp: commit.date, // simple-git returns ISO string usually, or valid date string
            data: {
                hash: commit.hash,
                date: commit.date,
                message: commit.message,
                body: commit.body,
                refs: commit.refs,
                author_name: commit.author_name,
                author_email: commit.author_email
            },
            metadata: {
                // Tagging noise early helps, but per instructions we keep it raw. 
                // We can add a simple flag if it's obviously machine generated
                isNoise: this.isNoise(commit.message)
            }
        }));
    }

    private isNoise(message: string): boolean {
        const lower = message.toLowerCase();
        return lower.startsWith('chore') || lower.startsWith('merge') || lower.startsWith('wip');
    }
}
