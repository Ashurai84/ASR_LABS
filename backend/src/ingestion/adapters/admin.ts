import fs from 'fs';
import path from 'path';
import { v5 as uuidv5 } from 'uuid';
import { IngestionSourceAdapter, RawSignal } from '../interfaces';

const ADMIN_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export class AdminAdapter implements IngestionSourceAdapter {
    name = 'admin';

    async fetchSignals(projectRoot: string, projectId: string): Promise<RawSignal[]> {
        const timelinePath = path.join(projectRoot, 'timeline.md');
        if (!fs.existsSync(timelinePath)) return [];

        try {
            const content = fs.readFileSync(timelinePath, 'utf8');
            // Parse Markdown Timeline: ### YYYY-MM-DD • TYPE
            const entries: RawSignal[] = [];
            const sections = content.split('---');

            for (const section of sections) {
                const lines = section.trim().split('\n');
                const headerLine = lines.find(l => l.startsWith('###'));
                if (!headerLine) continue;

                const match = headerLine.match(/###\s+(\d{4}-\d{2}-\d{2})\s+•\s+(\w+)/);
                if (!match) continue;

                const date = match[1];
                const type = match[2].toLowerCase();
                const titleLine = lines.find(l => l.startsWith('**')) || '';
                const title = titleLine.replace(/\*\*/g, '').trim();
                const body = lines.filter(l => !l.startsWith('###') && !l.startsWith('**')).join('\n').trim();

                const eventId = uuidv5(`${projectId}-${date}-${title}`, ADMIN_NAMESPACE);

                entries.push({
                    id: eventId,
                    projectId: projectId,
                    source: 'manual',
                    timestamp: new Date(date).toISOString(),
                    data: {
                        title,
                        details: { description: body }
                    },
                    metadata: {
                        category: type
                    }
                });
            }

            return entries;
        } catch (e) {
            console.error(`Error parsing timeline.md in ${projectRoot}:`, e);
            return [];
        }
    }

    async fetchProjectMetadata(projectRoot: string): Promise<any> {
        const metaPath = path.join(projectRoot, 'project.md');
        if (!fs.existsSync(metaPath)) return null;

        try {
            const text = fs.readFileSync(metaPath, 'utf8');
            const regex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
            const match = text.match(regex);
            if (!match) return null;

            const yaml = match[1];
            const data: any = {};
            yaml.split('\n').forEach(line => {
                const [key, ...val] = line.split(':');
                if (key && val.length) {
                    let value = val.join(':').trim();
                    if (value.startsWith('[') && value.endsWith(']')) {
                        data[key.trim().toLowerCase()] = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
                    } else {
                        data[key.trim().toLowerCase()] = value.replace(/^["']|["']$/g, '');
                    }
                }
            });

            return data;
        } catch { return null; }
    }
}
