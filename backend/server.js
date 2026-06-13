const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
