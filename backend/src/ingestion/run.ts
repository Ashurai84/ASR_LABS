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

import { AdminAdapter } from './adapters/admin';
import fs from 'fs';

const TIMELINE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Configuration & Discovery
const PROJECTS_ROOT = path.resolve(__dirname, '../../../');
const ADMIN_PROJECTS_DIR = path.resolve(__dirname, '../../../admin/content/projects');

function getDiscoveredProjects(): IngestionConfig['projects'] {
    const projects: IngestionConfig['projects'] = [];

    if (fs.existsSync(ADMIN_PROJECTS_DIR)) {
        const dirs = fs.readdirSync(ADMIN_PROJECTS_DIR).filter(f => fs.statSync(path.join(ADMIN_PROJECTS_DIR, f)).isDirectory());
        dirs.forEach(id => {
            const adminPath = path.join(ADMIN_PROJECTS_DIR, id);
            let repoPath = adminPath;

            // Simple metadata check for local_path mapping
            const metaPath = path.join(adminPath, 'project.md');
            if (fs.existsSync(metaPath)) {
                const text = fs.readFileSync(metaPath, 'utf8');
                const match = text.match(/local_path:\s*["']?([^"'\n\r]+)["']?/i);
                if (match) {
                    repoPath = path.resolve(adminPath, match[1]);
                    console.log(`[Discovery] Project ${id} resolved repo path: ${repoPath}`);
                }
            }

            projects.push({
                id,
                path: repoPath,
                adminPath: adminPath
            });
        });
    }

    return projects;
}

const CONFIG: IngestionConfig = {
    projects: getDiscoveredProjects()
};

const STATE_FILE_PATH = path.resolve(__dirname, '../../../frontend/public/data/lab-state.json');

async function main() {
    console.log('[Runner] Starting pipeline...');

    // Define content directory up-front (used in project loop and final assembly)
    const ADMIN_CONTENT_DIR = path.resolve(__dirname, '../../../admin/content');

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
        if (p.commitCount > 0) {
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
                        lines_changed: p.linesChanged,
                        messages: p.messages
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
    const updatedProjects: Project[] = [];
    const adminAdapter = new AdminAdapter();

    for (const pConfig of CONFIG.projects) {
        // Admin adapter now gets the adminPath specifically
        const meta = await adminAdapter.fetchProjectMetadata(pConfig.adminPath || pConfig.path);

        // Skip projects not explicitly published
        if (meta?.published !== 'true') {
            console.log(`[Runner] Skipping unpublished project: ${pConfig.id}`);
            continue;
        }

        const existingProject = currentProjects.find(p => p.id === pConfig.id);

        // Moderation: Load project-specific visibility rules
        let hiddenDates: string[] = [];
        const moderationPath = path.join(pConfig.path, 'pulse-moderation.json');
        if (fs.existsSync(moderationPath)) {
            try {
                const moderation = JSON.parse(fs.readFileSync(moderationPath, 'utf8'));
                hiddenDates = moderation.hiddenDates || [];
            } catch (e) {
                console.warn(`[Runner] Failed to read moderation for ${pConfig.id}`);
            }
        }

        // 1. Filter pulses (affects health metrics)
        let pPulses = (projectPulses[pConfig.id] || []).filter(p => !hiddenDates.includes(p.date));
        if (pPulses.length < (projectPulses[pConfig.id]?.length || 0)) {
            console.log(`[Runner] Moderation applied to ${pConfig.id}: filtered ${projectPulses[pConfig.id].length - pPulses.length} pulses.`);
        }

        // 2. Filter timeline events (affects journal display)
        const pTimeline = Object.values(timelineEvents).filter(e => e.project_id === pConfig.id);
        const filteredTimeline = pTimeline.filter(e => {
            if (e.type !== 'pulse') return true;
            return !hiddenDates.includes(e.date);
        });
        filteredTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const lastShip = filteredTimeline.find(e => e.type === 'ship')?.date;
        const lastDecision = filteredTimeline.find(e => e.type === 'decision')?.date;

        const health = healthCalc.compute({
            projectId: pConfig.id,
            pulses: pPulses,
            lastShipDate: lastShip,
            lastDecisionDate: lastDecision,
            previousHealth: existingProject?.health
        });

        const projectObj: Project = {
            id: pConfig.id,
            name: meta?.name || existingProject?.name || pConfig.id,
            description: meta?.description || existingProject?.description || '',
            status: (meta?.status as any) || existingProject?.status || 'build',
            repository_url: meta?.github || existingProject?.repository_url || '',
            tags: meta?.tags || existingProject?.tags || [],
            timeline_event_ids: filteredTimeline.map(e => e.id),
            health: health,
            derived: {
                focus_score: 0,
                activity_level: 'idle',
                last_decision_date: lastDecision || '',
                last_event_date: filteredTimeline[0]?.date || ''
            }
        };

        // Merge case study data from admin/content/projects/<id>.json if present
        const caseStudyPath = path.join(ADMIN_CONTENT_DIR, 'projects', `${pConfig.id}.json`);
        if (fs.existsSync(caseStudyPath)) {
            try {
                const caseStudyData = JSON.parse(fs.readFileSync(caseStudyPath, 'utf8'));
                if (caseStudyData.cover_image) projectObj.cover_image = caseStudyData.cover_image;
                if (caseStudyData.images) projectObj.images = caseStudyData.images;
                if (caseStudyData.my_role) projectObj.my_role = caseStudyData.my_role;
                if (caseStudyData.contributions) projectObj.contributions = caseStudyData.contributions;
                if (caseStudyData.tech_stack) projectObj.tech_stack = caseStudyData.tech_stack;
                if (caseStudyData.links) projectObj.links = caseStudyData.links;
                if (caseStudyData.outcome) projectObj.outcome = caseStudyData.outcome;
                console.log(`[Runner] Merged case study data for project: ${pConfig.id}`);
            } catch (e) {
                console.warn(`[Runner] Failed to merge case study data for ${pConfig.id}:`, e);
            }
        }

        projectsForFocus.push({ ...projectObj, recentPulses: pPulses });
        updatedProjects.push(projectObj);
    }

    // 7. Compute Focus
    console.log('[Runner] Computing focus...');
    const focusResult = focusCalc.compute({
        projects: projectsForFocus,
        previousState: prevState?.derived,
    });

    for (const p of updatedProjects) {
        const res = focusResult.projects[p.id];
        if (res) {
            p.derived.focus_score = res.score;
            p.derived.activity_level = res.activityLevel;
        }
    }

    // 8. Final Assembly

    // CLEANUP: Drop orphaned timeline events for deleted projects
    const validProjectIds = new Set(updatedProjects.map(p => p.id));
    for (const eventId of Object.keys(timelineEvents)) {
        if (!validProjectIds.has(timelineEvents[eventId].project_id)) {
            delete timelineEvents[eventId];
        }
    }

    const timelineIndex = Object.keys(timelineEvents).sort((a, b) => {
        return new Date(timelineEvents[b].date).getTime() - new Date(timelineEvents[a].date).getTime();
    });

    // Load Admin Data (Tools, Profile, Published Notes)
    // ADMIN_CONTENT_DIR already declared above
    const tools = JSON.parse(fs.readFileSync(path.join(ADMIN_CONTENT_DIR, 'tools.json'), 'utf8') || '[]');

    let profile = {};
    const profilePath = path.join(ADMIN_CONTENT_DIR, 'profile.md');
    if (fs.existsSync(profilePath)) {
        const profileContent = fs.readFileSync(profilePath, 'utf8');
        const match = profileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
        if (match) {
            const lines = match[1].split('\n');
            const data: any = {};
            lines.forEach(l => {
                const [k, ...v] = l.split(':');
                if (k && v.length) data[k.trim().toLowerCase()] = v.join(':').trim().replace(/^["']|["']$/g, '');
            });
            profile = { ...data, bio: data.bio || match[2].trim() };
        }
    }

    // Ingest Notes
    const notes: any[] = [];
    const notesDir = path.join(ADMIN_CONTENT_DIR, 'notes');
    if (fs.existsSync(notesDir)) {
        const noteFiles = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));
        for (const file of noteFiles) {
            const content = fs.readFileSync(path.join(notesDir, file), 'utf8');
            const metaMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
            if (!metaMatch) continue;

            const metaLines = metaMatch[1].split('\n');
            const meta: any = {};
            metaLines.forEach(l => {
                const [k, ...v] = l.split(':');
                if (k && v.length) meta[k.trim().toLowerCase()] = v.join(':').trim().replace(/^["']|["']$/g, '');
            });

            if (meta.published === 'true') {
                notes.push({
                    id: file.replace('.md', ''),
                    title: meta.title || file,
                    date: meta.date || '',
                    content: metaMatch[2].trim()
                });
            }
        }
    }

    const newState: LabState = {
        meta: {
            generated_at: new Date().toISOString(),
            version: '1.1',
            system_health: 'operational'
        },
        derived: {
            current_focus_project_id: focusResult.global.currentFocusId,
            global_health: 100
        },
        projects: updatedProjects,
        timeline_index: timelineIndex,
        timeline_events: timelineEvents,
        tools: tools,
        notes: notes,
        profile: profile
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
