const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM services ORDER BY sort_order ASC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST add
router.post('/', async (req, res) => {
    const { icon, title, description, link, sort_order } = req.body;
    if (!icon || !title || !description) {
        return res.status(400).json({ success: false, message: 'Icon, title and description are required.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO services (icon, title, description, link, sort_order) VALUES (?, ?, ?, ?, ?)',
            [icon, title, description, link || '#portfolio', sort_order || 0]
        );
        res.json({ success: true, message: 'Service added successfully!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    const { icon, title, description, link, sort_order } = req.body;
    try {
        await db.query(
            'UPDATE services SET icon=?, title=?, description=?, link=?, sort_order=? WHERE id=?',
            [icon, title, description, link || '#portfolio', sort_order || 0, req.params.id]
        );
        res.json({ success: true, message: 'Service updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Service deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;