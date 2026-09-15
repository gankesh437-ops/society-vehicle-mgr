const express = require('express');
const uuid = require('uuid');
const db = require('../config/database');
const { authMiddleware } = require('../config/auth');

const router = express.Router();

// Start Duty
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { tower } = req.body;

    if (!tower) {
      return res.status(400).json({ error: 'Tower is required' });
    }

    // Check duty slot availability
    const result = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE tower = $1 AND on_duty = true',
      [tower]
    );

    if (result.rows[0].count >= 2) {
      return res.status(400).json({ error: 'Duty slot full for this tower' });
    }

    // Update user
    await db.query(
      'UPDATE users SET on_duty = true, tower = $1, duty_since = NOW() WHERE id = $2',
      [tower, req.user.userId]
    );

    // Create duty session
    const sessionId = uuid.v4();
    await db.query(
      'INSERT INTO duty_sessions (id, guard_id, tower, start_time) VALUES ($1, $2, $3, NOW())',
      [sessionId, req.user.userId, tower]
    );

    res.json({ message: 'Duty started', sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start duty' });
  }
});

// End Duty
router.post('/end', authMiddleware, async (req, res) => {
  try {
    await db.query(
      'UPDATE users SET on_duty = false, tower = NULL, duty_since = NULL WHERE id = $1',
      [req.user.userId]
    );

    await db.query(
      'UPDATE duty_sessions SET end_time = NOW() WHERE guard_id = $1 AND end_time IS NULL',
      [req.user.userId]
    );

    res.json({ message: 'Duty ended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to end duty' });
  }
});

// Get Attendance
router.get('/attendance/:guardId', authMiddleware, async (req, res) => {
  try {
    const { guardId } = req.params;
    const { from, to } = req.query;

    let query = 'SELECT * FROM duty_sessions WHERE guard_id = $1';
    const params = [guardId];
    let paramCount = 2;

    if (from) {
      query += ` AND start_time >= $${paramCount}`;
      params.push(from);
      paramCount++;
    }
    if (to) {
      query += ` AND start_time <= $${paramCount}`;
      params.push(to);
      paramCount++;
    }

    query += ' ORDER BY start_time DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

module.exports = router;
