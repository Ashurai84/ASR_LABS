import type { LabState } from '../types/lab-state';

export const LAB_STATE_URL = '/data/lab-state.json';

export async function fetchLabState(): Promise<LabState | null> {
    try {
        const response = await fetch(LAB_STATE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as LabState;
    } catch (error) {
        console.error('Failed to fetch Lab State:', error);
        return null;
    }
}
