import fs from 'fs';
import path from 'path';
import { LabState } from '../schemas/lab-state';

export class SnapshotWriter {
    private stateFilePath: string;

    constructor(stateFilePath: string) {
        this.stateFilePath = stateFilePath;
    }

    async write(state: LabState): Promise<void> {
        const tempPath = `${this.stateFilePath}.tmp`;

        try {
            // 1. Serialize
            const jsonContent = JSON.stringify(state, null, 2);

            // 2. Write to Temp
            await fs.promises.writeFile(tempPath, jsonContent, 'utf8');

            // 3. Validate: Read back and parse to ensure integrity
            const writtenContent = await fs.promises.readFile(tempPath, 'utf8');
            const parsed = JSON.parse(writtenContent);

            if (!this.isValidShape(parsed)) {
                throw new Error('Snapshot validation failed: Invalid LabState shape');
            }

            // 4. Atomic Rename (Replace existing)
            await fs.promises.rename(tempPath, this.stateFilePath);

            console.log(`[SnapshotWriter] Successfully wrote state to ${this.stateFilePath}`);
        } catch (error) {
            console.error(`[SnapshotWriter] Failed to write snapshot:`, error);
            // Attempt to cleanup temp
            try {
                await fs.promises.unlink(tempPath);
            } catch (e) {
                // Ignore if file doesn't exist
            }
            throw error;
        }
    }

    // Minimal shape check
    private isValidShape(data: any): boolean {
        if (!data || typeof data !== 'object') return false;

        // Check critical top-level keys based on Schema
        const requiredKeys = ['meta', 'projects', 'timeline_events', 'derived'];
        for (const key of requiredKeys) {
            if (!(key in data)) return false;
        }

        return true;
    }

    async read(): Promise<LabState | null> {
        if (!fs.existsSync(this.stateFilePath)) {
            return null;
        }
        try {
            const content = await fs.promises.readFile(this.stateFilePath, 'utf8');
            return JSON.parse(content) as LabState;
        } catch (error) {
            console.error(`[SnapshotWriter] Failed to read existing state:`, error);
            return null;
        }
    }
}
