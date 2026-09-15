const express = require('express');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../config/auth');

const router = express.Router();

// Get All Users (Admin only)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, mobile, role, tower, on_duty, approval_status, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get User by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT id, name, email, mobile, role, tower, photo_url, on_duty FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update User Profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile } = req.body;

    if (req.user.userId !== id) {
      return res.status(403).json({ error: 'Can only update your own profile' });
    }

    await db.query('UPDATE users SET name = $1, mobile = $2, updated_at = NOW() WHERE id = $3', [name, mobile, id]);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Approve User (Admin only)
router.post('/:id/approve', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET approval_status = $1, updated_at = NOW() WHERE id = $2', ['approved', id]);
    res.json({ message: 'User approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Reject User (Admin only)
router.post('/:id/reject', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET approval_status = $1, updated_at = NOW() WHERE id = $2', ['rejected', id]);
    res.json({ message: 'User rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

module.exports = router;
