import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { v5 as uuidv5 } from 'uuid';
import { IngestionSourceAdapter, RawSignal } from '../interfaces';

// Using a namespace UUID for generating deterministic IDs for manual events if they lack one
const MANUAL_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

interface ManualTimelineFile {
    events: Array<{
        id?: string;
        date: string;
        type: string;
        title: string;
        details?: any;
        source?: string;
    }>;
}

export class ManualAdapter implements IngestionSourceAdapter {
    name = 'manual';

    async fetchSignals(projectRoot: string, projectId: string): Promise<RawSignal[]> {
        const timelinePath = path.join(projectRoot, 'timeline.yaml');

        if (!fs.existsSync(timelinePath)) {
            return []; // No manual events for this project
        }

        try {
            const fileContent = fs.readFileSync(timelinePath, 'utf8');
            const doc = yaml.load(fileContent) as ManualTimelineFile;

            if (!doc || !Array.isArray(doc.events)) {
                console.warn(`Invalid timeline.yaml in ${projectRoot}`);
                return [];
            }

            return doc.events.map(event => {
                // Determine ID: prefer explicit ID, otherwise generate hash
                const eventId = event.id || uuidv5(`${projectId}-${event.date}-${event.title}`, MANUAL_NAMESPACE);

                return {
                    id: eventId,
                    projectId: projectId,
                    source: 'manual',
                    timestamp: new Date(event.date).toISOString(),
                    data: event, // Keep the raw YAML object
                    metadata: {
                        category: event.type
                    }
                };
            });
        } catch (e) {
            console.error(`Error parsing timeline.yaml in ${projectRoot}:`, e);
            return [];
        }
    }
}
