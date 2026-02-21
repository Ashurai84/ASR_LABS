import { useState, useEffect } from 'react';
import type { LabState } from '../types/lab-state';
import { fetchLabState } from '../services/api';

export function useLabState() {
    const [data, setData] = useState<LabState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: number | ReturnType<typeof setTimeout>;

        async function load() {
            try {
                // Avoid cache in dev environment for instant updates
                const timestamp = new Date().getTime();
                const state = await fetchLabState(timestamp);

                // Let's modify the api.ts fetch directly to ignore cache in the next step, for now just poll.
                if (state && isMounted) {
                    setData(state);
                } else if (!state && isMounted) {
                    setError('Failed to load lab data');
                }
            } catch (err) {
                if (isMounted) setError('Error loading data');
            } finally {
                if (isMounted) {
                    setLoading(false);
                    // Poll every 3 seconds
                    timeoutId = setTimeout(load, 3000);
                }
            }
        }

        load();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return { labState: data, loading, error };
}
