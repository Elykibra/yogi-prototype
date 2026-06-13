# Yogi E-commerce Prototype

A simple role-based e-commerce platform where users see different prices based on their account status.

## Project Structure

```
yogi-prototype/
├── backend/          # Node.js + Express + PostgreSQL
├── db/              # Database schema
└── README.md
```

## Backend Setup

### Prerequisites
- Node.js (v14+)
- PostgreSQL (running locally or remotely)

### Installation

1. **Set up database:**
   ```bash
   # Create a new PostgreSQL database named yogi_db
   createdb yogi_db
   
   # Run the schema
   psql yogi_db < backend/db/schema.sql
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment:**
   Edit `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yogi_db
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   PORT=3001
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   Server runs on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Products
- `GET /products` - Get all products (with tiered pricing)
- `GET /products/:id` - Get product details
- `POST /products` - Add product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Orders
- `POST /orders` - Create order
- `GET /orders` - Get user's order history
- `GET /orders/:id` - Get order details
- `GET /admin/orders` - Get all orders (admin only)
- `PUT /orders/:id` - Update order status (admin only)

### Admin
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id` - Update user account status

## Quick Test

1. Register a user:
   ```bash
   curl -X POST http://localhost:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John","email":"john@test.com","password":"password123"}'
   ```

2. Login:
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@test.com","password":"password123"}'
   ```

3. Use the token in requests:
   ```bash
   curl http://localhost:3001/products \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Next Steps

- [ ] Create React frontend
- [ ] Add product images
- [ ] Improve admin dashboard
- [ ] Add payment gateway (Stripe)
- [ ] Add shipping integration
