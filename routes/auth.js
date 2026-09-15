const express = require('express');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const db = require('../config/database');
const { generateToken } = require('../config/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuid.v4();

    await db.query(
      'INSERT INTO users (id, name, email, password, mobile, role, approval_status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
      [userId, name, email, hashedPassword, mobile || null, 'user', 'pending']
    );

    res.status(201).json({ message: 'User registered successfully. Awaiting admin approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.approval_status === 'rejected') {
      return res.status(403).json({ error: 'Your account has been rejected by admin' });
    }

    if (user.approval_status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tower: user.tower,
        on_duty: user.on_duty
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current User
router.get('/me', require('../config/auth').authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, tower, mobile, photo_url, on_duty FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
