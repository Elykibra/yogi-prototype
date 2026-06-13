import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import './Orders.css';

const API_URL = 'http://localhost:3001';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { token } = useApp();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch orders');

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#ffc107';
      case 'Processing':
        return '#17a2b8';
      case 'Completed':
        return '#28a745';
      case 'Cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="orders-page">
      <h1>Order History</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">Order #{order.id}</div>
                <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                  {order.status}
                </div>
              </div>

              <div className="order-details">
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total:</span>
                  <span className="total">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <button
                className="view-details-btn"
                onClick={() => {
                  if (selectedOrder?.id === order.id) {
                    setSelectedOrder(null);
                  } else {
                    setSelectedOrder(order);
                  }
                }}
              >
                {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
              </button>

              {selectedOrder?.id === order.id && (
                <OrderDetails order={order} token={token} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetails({ order, token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/${order.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch order details');

      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="order-items-loading">Loading items...</div>;

  return (
    <div className="order-items">
      <h4>Items in this order:</h4>
      {items.map(item => (
        <div key={item.id} className="order-item">
          <span className="item-name">{item.name}</span>
          <span className="item-qty">x{item.quantity}</span>
          <span className="item-price">₱{parseFloat(item.price_at_purchase).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
