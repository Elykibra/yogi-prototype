import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import './Cart.css';

const API_URL = 'http://localhost:3001';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, token } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleCheckout = async () => {
    setError('');
    setLoading(true);

    try {
      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Checkout failed');
        return;
      }

      clearCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      setError('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1>Shopping Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="cart-content">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="price">₱{parseFloat(item.price).toFixed(2)} each</p>
              </div>

              <div className="item-quantity">
                <button
                  className="qty-btn"
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="item-total">
                ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>

              <button
                className="danger"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Items:</span>
            <span>{cart.length}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>Total:</span>
            <span>₱{total.toFixed(2)}</span>
          </div>

          <button
            className="primary checkout-btn"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>

          <button
            className="secondary"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
