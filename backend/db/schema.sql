CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  account_status VARCHAR(50) DEFAULT 'Regular' CHECK (account_status IN ('Regular', 'Premium', 'Dealer', 'Distributor')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  regular_price DECIMAL(10, 2) NOT NULL,
  premium_price DECIMAL(10, 2) NOT NULL,
  dealer_price DECIMAL(10, 2) NOT NULL,
  distributor_price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
