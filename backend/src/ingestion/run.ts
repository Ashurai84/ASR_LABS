import { IngestionEngine } from './engine';
import { PulseAggregator } from './pulse-aggregator';
import { HealthCalculator } from '../compute/health';
import { FocusCalculator, ProjectWithPulses } from '../compute/focus';
import { SnapshotWriter } from '../writer/snapshot-writer';
import { LabState, Project, TimelineEvent, HealthScore, GlobalDerived } from '../schemas/lab-state';
import { IngestionConfig } from './interfaces';
import { PulseSummary } from './pulse-aggregator';

import path from 'path';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

const TIMELINE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Configuration
const CONFIG: IngestionConfig = {
    projects: [
        {
            id: 'asr-lab',
            path: path.resolve(__dirname, '../../../') // Points to /Users/ashutoshrai/Desktop/Portfolio
        },
    ]
};

const STATE_FILE_PATH = path.resolve(__dirname, '../../state/lab-state.json');

async function main() {
    console.log('[Runner] Starting pipeline...');

    // 1. Initialize Components
    const ingestion = new IngestionEngine(CONFIG);
    const pulseAggregator = new PulseAggregator();
    const healthCalc = new HealthCalculator();
    const focusCalc = new FocusCalculator();
    const writer = new SnapshotWriter(STATE_FILE_PATH);

    // 2. Read Existing State
    const prevState = await writer.read();
    const timelineEvents: Record<string, TimelineEvent> = prevState?.timeline_events || {};
    const currentProjects: Project[] = prevState?.projects || [];

    // 3. Ingest Raw Signals
    console.log('[Runner] Ingesting signals...');
    const allSignals = await ingestion.fetchAllSignals();
    console.log(`[Runner] Fetched ${allSignals.length} raw signals.`);

    // 4. Aggregate Pulses
    const pulses = pulseAggregator.aggregate(allSignals);
    console.log(`[Runner] Aggregated ${pulses.length} pulses.`);

    // 5. Build Project Context & Timeline
    // We need to group pulses by projectId for the next steps
    const projectPulses: Record<string, PulseSummary[]> = {};
    for (const p of pulses) {
        if (!projectPulses[p.projectId]) projectPulses[p.projectId] = [];
        projectPulses[p.projectId].push(p);
    }

    // TODO: Convert 'significant' raw signals to Timeline Events (Decisions, Ships)
    // Timeline events are separate from Pulses (Architecture Section 4.1)
    // For each project, iterate raw manual signals
    for (const signal of allSignals) {
        if (signal.source === 'manual' || signal.source === 'deploy') {
            const eventId = signal.id || uuidv5(`${signal.projectId}-${signal.timestamp}`, TIMELINE_NAMESPACE);
            if (!timelineEvents[eventId]) {
                timelineEvents[eventId] = {
                    id: eventId,
                    project_id: signal.projectId,
                    type: (signal.metadata?.category as any) || 'milestone',
                    date: signal.timestamp,
                    title: signal.data.title || 'Untitled Event',
                    details: signal.data.details || {},
                    source: (signal.source as any),
                    derived: {
                        summary_text: signal.data.details?.description || '', // quick summary
                        impact_score: 50 // default, compute logic later
                    }
                };
            }
        }
    }

    // Generate Pulse Events for Timeline (if significant enough)
    for (const p of pulses) {
        // Pulse activity for Timeline (Architecture 6.1: Pulse events generated if thresholds met)
        if (p.commitCount > 5) {
            if (!timelineEvents[p.id]) {
                timelineEvents[p.id] = {
                    id: p.id,
                    project_id: p.projectId,
                    type: 'pulse',
                    date: p.date,
                    title: `Active Day: ${p.commitCount} commits`,
                    source: 'system',
                    details: {
                        commit_count: p.commitCount,
                        lines_changed: p.linesChanged
                    },
                    derived: {
                        summary_text: `${p.commitCount} commits on ${p.date}`,
                        impact_score: Math.min(p.commitCount, 10) // simple logic
                    }
                };
            }
        }
    }

    // 6. Compute Health & Prepare Focus Input
    const projectsForFocus: ProjectWithPulses[] = [];

    // Assuming we have a master list of projects defined in Config or State.
    // If Config defines project X, we process X. New projects might need auto-discovery.
    // For now, iterate Config projects.

    const updatedProjects: Project[] = [];

    for (const pConfig of CONFIG.projects) {
        const existingProject = currentProjects.find(p => p.id === pConfig.id);
        const pPulses = projectPulses[pConfig.id] || [];

        // Compute Health
        // We need lastShip/lastDecision date. 
        // Heuristic: check timelineEvents for this project
        const pTimeline = Object.values(timelineEvents).filter(e => e.project_id === pConfig.id);
        // Sort desc date
        pTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const lastShip = pTimeline.find(e => e.type === 'ship')?.date;
        const lastDecision = pTimeline.find(e => e.type === 'decision')?.date;

        const health = healthCalc.compute({
            projectId: pConfig.id,
            pulses: pPulses,
            lastShipDate: lastShip,
            lastDecisionDate: lastDecision,
            previousHealth: existingProject?.health
        });

        // Create Updated Project Object
        const projectObj: Project = {
            id: pConfig.id,
            name: existingProject?.name || pConfig.id, // Fallback name
            description: existingProject?.description || '',
            status: existingProject?.status || 'idea',
            repository_url: existingProject?.repository_url || '',
            tags: existingProject?.tags || [],
            timeline_event_ids: pTimeline.map(e => e.id),
            health: health,
            derived: {
                focus_score: 0, // placeholder, computed next
                activity_level: 'idle',
                last_decision_date: lastDecision || '',
                last_event_date: pTimeline[0]?.date || ''
            }
        };

        projectsForFocus.push({ ...projectObj, recentPulses: pPulses });
        updatedProjects.push(projectObj);
    }

    // 7. Compute Focus
    console.log('[Runner] Computing focus...');

    const focusResult = focusCalc.compute({
        projects: projectsForFocus,
        previousState: prevState?.derived,
        // manualOverrideProjectId -- could pass from CLI arg if we had one
    });

    // Apply Results back to Projects
    for (const p of updatedProjects) {
        const res = focusResult[p.id];
        if (res) {
            p.derived.focus_score = res.score;
            p.derived.activity_level = res.activityLevel;
        }
    }

    // 8. Final Assembly
    // Collect all event IDs for global index
    const timelineIndex = Object.keys(timelineEvents).sort((a, b) => {
        return new Date(timelineEvents[b].date).getTime() - new Date(timelineEvents[a].date).getTime();
    });

    const newState: LabState = {
        meta: {
            generated_at: new Date().toISOString(),
            version: '1.0',
            system_health: 'operational'
        },
        derived: {
            current_focus_project_id: focusResult.global.currentFocusId,
            global_health: 100 // Placeholder logic, could average project healths
        },
        projects: updatedProjects,
        timeline_index: timelineIndex,
        timeline_events: timelineEvents,
        tools: prevState?.tools || [], // Keep manual tools list if any
        notes: prevState?.notes || []
    };

    // 9. Write Snapshot
    console.log('[Runner] Writing snapshot...');
    await writer.write(newState);

    console.log('[Runner] Pipeline Complete.');
}

// Execute
if (require.main === module) {
    main().catch(err => {
        console.error('Fatal Pipeline Error:', err);
        process.exit(1);
    });
}
