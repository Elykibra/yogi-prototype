import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, cart } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/products" className="navbar-brand">
          <span style={{ fontSize: '28px', marginRight: '8px' }}>🛒</span>Yogi Shop
        </Link>

        <div className="navbar-menu">
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/cart" className="nav-link">
            Cart <span className="cart-count">{cart.length}</span>
          </Link>
          <Link to="/orders" className="nav-link">Orders</Link>
          {user?.is_admin && <Link to="/admin" className="nav-link admin">Admin</Link>}

          <div className="user-section">
            <span className="user-status">
              {user.name} ({user.account_status})
            </span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
