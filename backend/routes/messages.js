const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all messages
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM messages ORDER BY received_at DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT mark as read
router.put('/:id/read', async (req, res) => {
    try {
        await db.query('UPDATE messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;