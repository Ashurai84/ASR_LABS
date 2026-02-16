import { useState, useEffect } from 'react';
import type { LabState } from '../types/lab-state';
import { fetchLabState } from '../services/api';

export function useLabState() {
    const [data, setData] = useState<LabState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const state = await fetchLabState();
                if (state) {
                    setData(state);
                } else {
                    setError('Failed to load lab data');
                }
            } catch (err) {
                setError('Error loading data');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return { labState: data, loading, error };
}
