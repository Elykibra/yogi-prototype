import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import './AdminDashboard.css';

const API_URL = 'https://yogi-prototype-backend-production.up.railway.app';

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useApp();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'products') fetchProducts();
    else if (tab === 'users') fetchUsers();
    else if (tab === 'orders') fetchOrders();
  }, [tab, token]);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${tab === 'products' ? 'active' : ''}`}
          onClick={() => setTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-btn ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          Users
        </button>
        <button
          className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {tab === 'products' && <ProductsTab products={products} token={token} onRefresh={fetchProducts} />}
          {tab === 'users' && <UsersTab users={users} token={token} onRefresh={fetchUsers} />}
          {tab === 'orders' && <OrdersTab orders={orders} token={token} onRefresh={fetchOrders} />}
        </>
      )}
    </div>
  );
}

function ProductsTab({ products, token, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    regular_price: '',
    premium_price: '',
    dealer_price: '',
    distributor_price: '',
    stock: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          regular_price: parseFloat(formData.regular_price),
          premium_price: parseFloat(formData.premium_price),
          dealer_price: parseFloat(formData.dealer_price),
          distributor_price: parseFloat(formData.distributor_price),
          stock: parseInt(formData.stock)
        })
      });

      if (res.ok) {
        alert('Product added successfully!');
        setShowForm(false);
        setFormData({
          name: '',
          description: '',
          regular_price: '',
          premium_price: '',
          dealer_price: '',
          distributor_price: '',
          stock: ''
        });
        onRefresh();
      }
    } catch (err) {
      alert('Failed to add product');
    }
  };

  return (
    <div className="tab-content">
      <button className="primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Product'}
      </button>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Regular Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.regular_price}
                onChange={(e) => setFormData({...formData, regular_price: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Premium Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.premium_price}
                onChange={(e) => setFormData({...formData, premium_price: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Dealer Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.dealer_price}
                onChange={(e) => setFormData({...formData, dealer_price: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Distributor Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.distributor_price}
                onChange={(e) => setFormData({...formData, distributor_price: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
            />
          </div>

          <button type="submit" className="primary">Add Product</button>
        </form>
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Regular</th>
              <th>Premium</th>
              <th>Dealer</th>
              <th>Distributor</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>₱{parseFloat(p.regular_price).toFixed(2)}</td>
                <td>₱{parseFloat(p.premium_price).toFixed(2)}</td>
                <td>₱{parseFloat(p.dealer_price).toFixed(2)}</td>
                <td>₱{parseFloat(p.distributor_price).toFixed(2)}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab({ users, token, onRefresh }) {
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account_status: newStatus })
      });

      if (res.ok) {
        alert('User status updated!');
        onRefresh();
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  return (
    <div className="tab-content">
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.account_status}</td>
                <td>
                  <select
                    value={user.account_status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab({ orders, token, onRefresh }) {
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert('Order status updated!');
        onRefresh();
      }
    } catch (err) {
      alert('Failed to update order');
    }
  };

  return (
    <div className="tab-content">
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.name}</td>
                <td>{order.email}</td>
                <td>₱{parseFloat(order.total_amount).toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
