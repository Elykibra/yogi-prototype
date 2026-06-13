const express = require('express');
const pool = require('../db/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get price for a product based on user status
const getPrice = async (productId, userId) => {
  const user = await pool.query('SELECT account_status FROM users WHERE id = $1', [userId]);
  const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

  const accountStatus = user.rows[0].account_status;
  const priceMap = {
    'Regular': product.rows[0].regular_price,
    'Premium': product.rows[0].premium_price,
    'Dealer': product.rows[0].dealer_price,
    'Distributor': product.rows[0].distributor_price
  };

  return priceMap[accountStatus] || product.rows[0].regular_price;
};

// Create order
router.post('/', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { items } = req.body; // items = [{ product_id, quantity }, ...]

    if (!items || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    let totalAmount = 0;
    for (const item of items) {
      const price = await getPrice(item.product_id, req.user.id);
      totalAmount += price * item.quantity;
    }

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, status, total_amount) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, 'Pending', totalAmount]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const price = await getPrice(item.product_id, req.user.id);
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, price]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      orderId,
      status: 'Pending',
      total_amount: totalAmount
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// Get user's order history
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT o.id, o.status, o.total_amount, o.created_at FROM orders o WHERE o.user_id = $1 ORDER BY o.created_at DESC',
      [req.user.id]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await pool.query(
      'SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.price_at_purchase FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1',
      [req.params.id]
    );

    return res.json({
      ...order.rows[0],
      items: items.rows
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT o.id, o.user_id, u.name, u.email, o.status, o.total_amount, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Processing', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
