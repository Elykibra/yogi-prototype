const express = require('express');
const pool = require('../db/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get price based on user's account status
const getPrice = (product, accountStatus) => {
  const priceMap = {
    'Regular': product.regular_price,
    'Premium': product.premium_price,
    'Dealer': product.dealer_price,
    'Distributor': product.distributor_price
  };
  return priceMap[accountStatus] || product.regular_price;
};

// Get all products (with tiered pricing for logged-in users)
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT account_status FROM users WHERE id = $1', [req.user.id]);
    const products = await pool.query('SELECT * FROM products');

    const productsWithPrice = products.rows.map(product => ({
      ...product,
      price: getPrice(product, user.rows[0].account_status)
    }));

    return res.json(productsWithPrice);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product with tiered pricing
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT account_status FROM users WHERE id = $1', [req.user.id]);
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);

    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = product.rows[0];
    return res.json({
      ...productData,
      price: getPrice(productData, user.rows[0].account_status)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add product (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, description, regular_price, premium_price, dealer_price, distributor_price, stock, image_url } = req.body;

    if (!name || !regular_price || !premium_price || !dealer_price || !distributor_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO products (name, description, regular_price, premium_price, dealer_price, distributor_price, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, description, regular_price, premium_price, dealer_price, distributor_price, stock || 0, image_url]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description, regular_price, premium_price, dealer_price, distributor_price, stock, image_url } = req.body;

    const result = await pool.query(
      'UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), regular_price = COALESCE($3, regular_price), premium_price = COALESCE($4, premium_price), dealer_price = COALESCE($5, dealer_price), distributor_price = COALESCE($6, distributor_price), stock = COALESCE($7, stock), image_url = COALESCE($8, image_url) WHERE id = $9 RETURNING *',
      [name, description, regular_price, premium_price, dealer_price, distributor_price, stock, image_url, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
