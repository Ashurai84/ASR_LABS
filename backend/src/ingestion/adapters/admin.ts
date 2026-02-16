import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { v5 as uuidv5 } from 'uuid';
import { IngestionSourceAdapter, RawSignal } from '../interfaces';

const ADMIN_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export class AdminAdapter implements IngestionSourceAdapter {
    name = 'admin';

    async fetchSignals(projectRoot: string, projectId: string): Promise<RawSignal[]> {
        const timelinePath = path.join(projectRoot, 'timeline.md');

        if (!fs.existsSync(timelinePath)) {
            return [];
        }

        try {
            const fileContent = fs.readFileSync(timelinePath, 'utf8');
            // Check if it's YAML or has frontmatter. For now assuming YAML list.
            const doc = yaml.load(fileContent) as any;

            if (!doc || !Array.isArray(doc.events)) {
                return [];
            }

            return doc.events.map((event: any) => {
                const eventId = event.id || uuidv5(`${projectId}-${event.date}-${event.title}`, ADMIN_NAMESPACE);

                return {
                    id: eventId,
                    projectId: projectId,
                    source: 'manual',
                    timestamp: new Date(event.date || Date.now()).toISOString(),
                    data: event,
                    metadata: {
                        category: event.type || 'decision'
                    }
                };
            });
        } catch (e) {
            console.error(`Error parsing timeline.md in ${projectRoot}:`, e);
            return [];
        }
    }

    /**
     * Helper to read project metadata from project.md
     */
    async fetchProjectMetadata(projectRoot: string): Promise<any> {
        const metaPath = path.join(projectRoot, 'project.md');
        if (!fs.existsSync(metaPath)) return null;

        try {
            const content = fs.readFileSync(metaPath, 'utf8');
            // Basic parsing: split by frontmatter or just take first header?
            // For now, let's assume the user writes YAML in the editor or we add frontmatter later.
            // Let's assume the content itself IS the description.
            return { description: content.substring(0, 500) };
        } catch { return null; }
    }
}
