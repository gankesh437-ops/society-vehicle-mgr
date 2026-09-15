const express = require('express');
const uuid = require('uuid');
const db = require('../config/database');
const { authMiddleware } = require('../config/auth');
const { io } = require('../server');

const router = express.Router();

// Send Alert
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { vehicle_id, vehicle_number, registered_tower, found_tower, message } = req.body;

    if (!vehicle_number || !registered_tower || !found_tower) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const alertId = uuid.v4();
    await db.query(
      `INSERT INTO vehicle_alerts (id, vehicle_id, vehicle_number, registered_tower, found_tower, message, reporter_id, created_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'open')`,
      [alertId, vehicle_id, vehicle_number, registered_tower, found_tower, message || null, req.user.userId]
    );

    // Emit real-time alert
    io.to(`tower-${registered_tower}`).emit('new-alert', {
      id: alertId,
      vehicle_number,
      message,
      found_in_tower: found_tower
    });

    res.status(201).json({ id: alertId, message: 'Alert sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send alert' });
  }
});

// Get Alerts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM vehicle_alerts WHERE 1=1';
    const params = [];

    if (status) {
      query += ` AND status = $1`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Resolve Alert
router.put('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE vehicle_alerts SET status = $1, resolved_at = NOW() WHERE id = $2', ['resolved', id]);
    res.json({ message: 'Alert resolved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

module.exports = router;
