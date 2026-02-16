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
const PROFILE_FILE = path.join(CONTENT_DIR, 'profile.json');

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

// --- API Endpoints ---

// 1. Structure: Get all projects, notes, tools
app.get('/api/structure', (req, res) => {
    const projects = fs.readdirSync(PROJECTS_DIR).filter(f => fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory());
    const notes = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'));
    const tools = readJson(TOOLS_FILE, []);
    const profile = readJson(PROFILE_FILE, { name: '', bio: '', links: {} });

    res.json({ projects, notes, tools, profile });
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

    res.json({ meta, timeline });
});

app.post('/api/project', (req, res) => {
    const { slug, meta, timeline } = req.body;
    const dir = path.join(PROJECTS_DIR, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (meta !== undefined) fs.writeFileSync(path.join(dir, 'project.md'), meta);
    if (timeline !== undefined) fs.writeFileSync(path.join(dir, 'timeline.md'), timeline);

    res.json({ success: true });
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

// 4. Tools & Profile (JSON storage for simplicity)
app.post('/api/data/:type', (req, res) => {
    const { type } = req.params;
    const file = type === 'tools' ? TOOLS_FILE : PROFILE_FILE;
    fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Admin Server running on http://localhost:${PORT}`);
});
