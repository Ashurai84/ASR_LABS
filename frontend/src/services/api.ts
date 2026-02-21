import type { LabState } from '../types/lab-state';

export const LAB_STATE_URL = '/data/lab-state.json';

export async function fetchLabState(timestamp?: number): Promise<LabState | null> {
    try {
        const url = timestamp ? `${LAB_STATE_URL}?t=${timestamp}` : LAB_STATE_URL;
        const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
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
