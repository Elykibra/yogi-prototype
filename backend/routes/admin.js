const express = require('express');
const pool = require('../db/db');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, account_status, is_admin, created_at FROM users ORDER BY created_at DESC'
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user account status
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { account_status } = req.body;

    if (!['Regular', 'Premium', 'Dealer', 'Distributor'].includes(account_status)) {
      return res.status(400).json({ error: 'Invalid account status' });
    }

    const result = await pool.query(
      'UPDATE users SET account_status = $1 WHERE id = $2 RETURNING id, name, email, account_status',
      [account_status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
