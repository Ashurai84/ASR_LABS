import express from 'express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(express.json());

// Paths
const CONTENT_DIR = path.resolve(__dirname, '../../admin/content');
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');
const NOTES_DIR = path.join(CONTENT_DIR, 'notes');
const TOOLS_FILE = path.join(CONTENT_DIR, 'tools.json');
const PROFILE_FILE = path.join(CONTENT_DIR, 'profile.md');

// Ensure directories exist
[CONTENT_DIR, PROJECTS_DIR, NOTES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper: Read JSON file safely
const readJson = (filePath, fallback = {}) => {
    if (!fs.existsSync(filePath)) return fallback;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch { return fallback; }
};

const startTime = new Date().toISOString();

// --- API Endpoints ---

// 0. Debug: Check server status
app.get('/api/debug', (req, res) => {
    res.json({ status: 'online', startTime, version: '1.2.5' });
});

// 1. Structure: Get all projects, notes, tools
app.get('/api/structure', (req, res) => {
    const projects = fs.readdirSync(PROJECTS_DIR).filter(f => fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory());
    const notes = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'));
    const tools = readJson(TOOLS_FILE, []);

    let profile = { name: '', bio: '', links: {} };
    if (fs.existsSync(PROFILE_FILE)) {
        try {
            const content = fs.readFileSync(PROFILE_FILE, 'utf8');
            const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
            if (match) {
                const data = yaml.load(match[1]);
                profile = { ...data, bio: data.bio || match[2].trim() };
            }
        } catch (e) { console.error("Error reading profile.md", e); }
    }

    res.json({ projects, notes, tools, profile, serverStart: startTime });
});

// 2. Project: Create/Get
app.get('/api/project/:slug', (req, res) => {
    const { slug } = req.params;
    const dir = path.join(PROJECTS_DIR, slug);
    if (!fs.existsSync(dir)) return res.status(404).json({ error: 'Project not found' });

    const meta = fs.existsSync(path.join(dir, 'project.md'))
        ? fs.readFileSync(path.join(dir, 'project.md'), 'utf8')
        : '';
    const timeline = fs.existsSync(path.join(dir, 'timeline.md'))
        ? fs.readFileSync(path.join(dir, 'timeline.md'), 'utf8')
        : '';

    const caseStudyPath = path.join(PROJECTS_DIR, `${slug}.json`);
    const caseStudy = fs.existsSync(caseStudyPath)
        ? readJson(caseStudyPath, {})
        : {};

    res.json({ meta, timeline, caseStudy });
});

// Fetch Remote Activity for Moderation
app.get('/api/project/:slug/activity', async (req, res) => {
    const { slug } = req.params;
    const { url } = req.query; // Expecting ?url=...
    const projectDir = path.join(PROJECTS_DIR, slug);
    const metaPath = path.join(projectDir, 'project.md');
    const moderationPath = path.join(projectDir, 'pulse-moderation.json');

    let githubUrl = url; // Prefer query param

    // Fall back to reading from project.md if url is not provided or empty
    if (!githubUrl && fs.existsSync(metaPath)) {
        try {
            const content = fs.readFileSync(metaPath, 'utf8');
            const githubMatch = content.match(/github:\s*["']?(https:\/\/github\.com\/([^"'\s]+))["']?/i);
            if (githubMatch) {
                githubUrl = githubMatch[1];
            }
        } catch (e) {
            console.error("Failed parsing project.md for github url", e);
        }
    }

    if (!githubUrl) return res.json({ pulses: [] });

    try {
        const repoPathMatch = githubUrl.match(/github\.com\/([^"'\s]+)/i);
        if (!repoPathMatch) return res.json({ pulses: [] });

        const repoPath = repoPathMatch[1].replace(/\.git$/, '').replace(/\/$/, '');

        // Fetch from GitHub
        const ghRes = await fetch(`https://api.github.com/repos/${repoPath}/commits?per_page=50`, {
            headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'ASR-Lab-Admin' }
        });

        if (!ghRes.ok) throw new Error(`GitHub API error: ${ghRes.status}`);
        const commits = await ghRes.json();

        // Group into daily pulses
        const pulsesMap = {};
        commits.forEach(c => {
            const date = c.commit.author.date.split('T')[0];
            if (!pulsesMap[date]) pulsesMap[date] = { date, commits: [] };
            pulsesMap[date].commits.push(c.commit.message);
        });

        const pulses = Object.values(pulsesMap).sort((a, b) => b.date.localeCompare(a.date));

        // Load moderation state
        const moderation = readJson(moderationPath, { hiddenDates: [] });

        res.json({ pulses, moderation });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch activity" });
    }
});

app.post('/api/project/:slug/moderation', (req, res) => {
    try {
        const { slug } = req.params;
        const projectDir = path.join(PROJECTS_DIR, slug);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }
        const moderationPath = path.join(projectDir, 'pulse-moderation.json');

        fs.writeFileSync(moderationPath, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/project', (req, res) => {
    const { slug, meta, timeline, caseStudy } = req.body;
    const dir = path.join(PROJECTS_DIR, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (meta !== undefined) fs.writeFileSync(path.join(dir, 'project.md'), meta);
    if (timeline !== undefined) fs.writeFileSync(path.join(dir, 'timeline.md'), timeline);
    if (caseStudy !== undefined) {
        fs.writeFileSync(path.join(PROJECTS_DIR, `${slug}.json`), JSON.stringify(caseStudy, null, 2));
    }

    res.json({ success: true });
});

app.delete('/api/project/:slug', (req, res) => {
    const { slug } = req.params;
    const dir = path.join(PROJECTS_DIR, slug);
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });

        const caseStudyPath = path.join(PROJECTS_DIR, `${slug}.json`);
        if (fs.existsSync(caseStudyPath)) fs.unlinkSync(caseStudyPath);

        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

// 3. Note: Create/Get
app.get('/api/note/:filename', (req, res) => {
    const filePath = path.join(NOTES_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Note not found' });
    res.json({ content: fs.readFileSync(filePath, 'utf8') });
});

app.post('/api/note', (req, res) => {
    const { filename, content } = req.body;
    fs.writeFileSync(path.join(NOTES_DIR, filename), content);
    res.json({ success: true });
});

app.delete('/api/note/:filename', (req, res) => {
    const filePath = path.join(NOTES_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Note not found' });
    }
});

// 4. Tools & Profile
app.post('/api/data/:type', (req, res) => {
    const { type } = req.params;
    if (type === 'profile') {
        const { bio, ...rest } = req.body;
        const frontmatter = yaml.dump(rest);
        const content = `---\n${frontmatter}---\n\n${bio || ''}`;
        fs.writeFileSync(PROFILE_FILE, content);
    } else {
        const file = type === 'tools' ? TOOLS_FILE : PROFILE_FILE;
        fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
    }
    res.json({ success: true });
});

// 5. Publish: Run Ingestion Script
app.post('/api/publish', (req, res) => {
    const backendDir = path.resolve(__dirname, '../../backend');
    exec('npm run ingest', { cwd: backendDir }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Publish error: ${error}`);
            // Log full stderr to catch build/syntax issues
            console.error(stderr);
            return res.status(500).json({ error: error.message, details: stderr });
        }
        res.json({ success: true, log: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Admin Server running on http://localhost:${PORT}`);
});
