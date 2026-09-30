// routes/skills.js — Skills CRUD API

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all skills
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM skills ORDER BY category, percentage DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST add new skill
router.post('/', async (req, res) => {
    const { name, percentage, category } = req.body;

    if (!name || !percentage || !category) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (percentage < 1 || percentage > 100) {
        return res.status(400).json({ success: false, message: 'Percentage must be between 1 and 100.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO skills (name, percentage, category) VALUES (?, ?, ?)',
            [name, percentage, category]
        );
        res.json({ success: true, message: 'Skill added successfully!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update skill
router.put('/:id', async (req, res) => {
    const { name, percentage, category } = req.body;

    try {
        await db.query(
            'UPDATE skills SET name=?, percentage=?, category=? WHERE id=?',
            [name, percentage, category, req.params.id]
        );
        res.json({ success: true, message: 'Skill updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE skill
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Skill deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;