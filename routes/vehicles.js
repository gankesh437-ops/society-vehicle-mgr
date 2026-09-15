const express = require('express');
const uuid = require('uuid');
const db = require('../config/database');
const { authMiddleware } = require('../config/auth');

const router = express.Router();

// Get All Vehicles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { tower, floor, flat, search } = req.query;

    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (tower) {
      query += ` AND tower = $${paramCount}`;
      params.push(tower);
      paramCount++;
    }
    if (floor) {
      query += ` AND floor = $${paramCount}`;
      params.push(floor);
      paramCount++;
    }
    if (flat) {
      query += ` AND flat = $${paramCount}`;
      params.push(flat);
      paramCount++;
    }
    if (search) {
      query += ` AND (vehicle_number ILIKE $${paramCount} OR owner_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Add Vehicle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { vehicle_number, tower, floor, flat, vehicle_type, parking_number, notes, owner_name, owner_mobile } = req.body;

    if (!vehicle_number || !tower || !floor || !flat) {
      return res.status(400).json({ error: 'Vehicle number, tower, floor, and flat are required' });
    }

    // Check for duplicates
    const dup = await db.query('SELECT id FROM vehicles WHERE vehicle_number = $1', [vehicle_number.toUpperCase()]);
    if (dup.rows.length > 0) {
      return res.status(400).json({ error: 'Vehicle already exists' });
    }

    const vehicleId = uuid.v4();
    await db.query(
      `INSERT INTO vehicles (id, vehicle_number, tower, floor, flat, vehicle_type, parking_number, notes, owner_name, owner_mobile, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [vehicleId, vehicle_number.toUpperCase(), tower, floor, flat, vehicle_type || 'car', parking_number || null, notes || null, owner_name || null, owner_mobile || null, req.user.userId]
    );

    res.status(201).json({ id: vehicleId, message: 'Vehicle added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Update Vehicle
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_number, tower, floor, flat, vehicle_type, parking_number, notes, owner_name, owner_mobile } = req.body;

    if (!vehicle_number || !tower || !floor || !flat) {
      return res.status(400).json({ error: 'Vehicle number, tower, floor, and flat are required' });
    }

    // Check for duplicate (excluding self)
    const dup = await db.query('SELECT id FROM vehicles WHERE vehicle_number = $1 AND id != $2', [vehicle_number.toUpperCase(), id]);
    if (dup.rows.length > 0) {
      return res.status(400).json({ error: 'Vehicle number already exists' });
    }

    await db.query(
      `UPDATE vehicles SET vehicle_number = $1, tower = $2, floor = $3, flat = $4, vehicle_type = $5, parking_number = $6, notes = $7, owner_name = $8, owner_mobile = $9, updated_at = NOW()
       WHERE id = $10`,
      [vehicle_number.toUpperCase(), tower, floor, flat, vehicle_type || 'car', parking_number || null, notes || null, owner_name || null, owner_mobile || null, id]
    );

    res.json({ message: 'Vehicle updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete Vehicle
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM vehicles WHERE id = $1', [id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

module.exports = router;
