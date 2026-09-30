const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM education ORDER BY sort_order ASC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST add
router.post('/', async (req, res) => {
    const { year, degree, institution, description, is_current, sort_order } = req.body;
    if (!year || !degree || !institution || !description) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO education (year, degree, institution, description, is_current, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [year, degree, institution, description, is_current || false, sort_order || 0]
        );
        res.json({ success: true, message: 'Education added successfully!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    const { year, degree, institution, description, is_current, sort_order } = req.body;
    try {
        await db.query(
            'UPDATE education SET year=?, degree=?, institution=?, description=?, is_current=?, sort_order=? WHERE id=?',
            [year, degree, institution, description, is_current || false, sort_order || 0, req.params.id]
        );
        res.json({ success: true, message: 'Education updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM education WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Education deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;