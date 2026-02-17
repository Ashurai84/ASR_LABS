import fs from 'fs';
import path from 'path';
import { IngestionSourceAdapter, RawSignal } from '../interfaces';

export class GitHubAdapter implements IngestionSourceAdapter {
    name = 'github';

    async fetchSignals(projectRoot: string, projectId: string): Promise<RawSignal[]> {
        // 1. Get GitHub URL from project.md metadata
        const metaPath = path.join(projectRoot, 'project.md');
        if (!fs.existsSync(metaPath)) return [];

        const githubUrl = this.getGithubUrl(metaPath);
        if (!githubUrl) {
            console.log(`[GitHubAdapter] No repo URL for ${projectId}`);
            return [];
        }

        const { owner, repo } = this.parseGithubUrl(githubUrl);
        if (!owner || !repo) {
            console.warn(`[GitHubAdapter] Could not parse URL: ${githubUrl}`);
            return [];
        }

        console.log(`[GitHubAdapter] Fetching commits for ${owner}/${repo}...`);

        try {
            // Using built-in fetch (Node 18+)
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'ASR-Lab-Portfolio'
                }
            });

            if (!response.ok) {
                console.error(`[GitHubAdapter] API Failure (${response.status}) for ${projectId}`);
                return [];
            }

            const commits = await response.json() as any[];

            return commits.map(c => ({
                id: c.sha,
                projectId: projectId,
                source: 'git', // Using 'git' source so PulseAggregator processes it
                timestamp: c.commit.author.date,
                data: {
                    hash: c.sha,
                    message: c.commit.message,
                    author: c.commit.author.name,
                    url: c.html_url
                },
                metadata: {
                    isNoise: this.isNoise(c.commit.message)
                }
            }));
        } catch (e) {
            console.error(`[GitHubAdapter] Request error for ${projectId}:`, e);
            return [];
        }
    }

    private getGithubUrl(metaPath: string): string | null {
        try {
            const content = fs.readFileSync(metaPath, 'utf8');
            // Simplified regex for frontmatter extraction
            const match = content.match(/github:\s*["']?(https:\/\/github\.com\/[^"'\s]+)["']?/i);
            return match ? match[1] : null;
        } catch { return null; }
    }

    private parseGithubUrl(url: string) {
        const parts = url.split('github.com/')[1]?.split('/');
        if (parts && parts.length >= 2) {
            return {
                owner: parts[0],
                repo: parts[1].replace(/\.git$/, '').replace(/\/$/, '')
            };
        }
        return { owner: null, repo: null };
    }

    private isNoise(msg: string): boolean {
        const m = msg.toLowerCase();
        return m.startsWith('chore') || m.startsWith('merge') || m.includes('wip');
    }
}
