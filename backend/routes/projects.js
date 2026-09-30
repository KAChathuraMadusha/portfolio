// routes/projects.js — Projects CRUD API

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single project
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create new project
router.post('/', async (req, res) => {
    const { title, description, tech_stack, image_url, live_url, github_url } = req.body;

    if (!title || !description || !tech_stack) {
        return res.status(400).json({ success: false, message: 'Title, description and tech stack are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO projects (title, description, tech_stack, image_url, live_url, github_url) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, tech_stack, image_url || '', live_url || '', github_url || '']
        );
        res.json({ success: true, message: 'Project added successfully!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update project
router.put('/:id', async (req, res) => {
    const { title, description, tech_stack, image_url, live_url, github_url } = req.body;

    try {
        await db.query(
            'UPDATE projects SET title=?, description=?, tech_stack=?, image_url=?, live_url=?, github_url=? WHERE id=?',
            [title, description, tech_stack, image_url || '', live_url || '', github_url || '', req.params.id]
        );
        res.json({ success: true, message: 'Project updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Project deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;