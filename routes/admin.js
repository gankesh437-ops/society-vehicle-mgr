const express = require('express');
const db = require('../config/database');
const { adminMiddleware } = require('../config/auth');

const router = express.Router();

// Get Dashboard Stats
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const vehicles = await db.query('SELECT COUNT(*) as count FROM vehicles');
    const users = await db.query('SELECT COUNT(*) as count FROM users');
    const onDuty = await db.query('SELECT COUNT(*) as count FROM users WHERE on_duty = true');
    const alerts = await db.query('SELECT COUNT(*) as count FROM vehicle_alerts WHERE status = \'open\'');

    res.json({
      totalVehicles: vehicles.rows[0].count,
      totalUsers: users.rows[0].count,
      guardOnDuty: onDuty.rows[0].count,
      openAlerts: alerts.rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get Pending Approvals
router.get('/pending', adminMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, mobile, created_at FROM users WHERE approval_status = \'pending\' ORDER BY created_at');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

module.exports = router;
