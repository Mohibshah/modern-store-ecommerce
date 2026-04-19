import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';
import { useCartStore } from '../store/useCartStore';
import './Dashboard.css';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const addAddress = useAuthStore((state) => state.addAddress);
  const removeAddress = useAuthStore((state) => state.removeAddress);
  const orders = useOrderStore((state) => state.orders);
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const [nameDraft, setNameDraft] = useState(user?.name || '');
  const [newAddress, setNewAddress] = useState('');

  const myOrders = useMemo(
    () => orders.filter((order) => order.customerEmail === user?.email).reverse(),
    [orders, user?.email]
  );

  const totalSpent = myOrders.reduce((acc, order) => acc + (order.total || 0), 0);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!nameDraft.trim()) return;
    updateProfile({ name: nameDraft.trim() });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    addAddress(newAddress);
    setNewAddress('');
  };

  const handleReorder = (orderItems) => {
    orderItems.forEach((item) => addItem(item, item.quantity));
    setCartOpen(true);
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <h1>Your Dashboard</h1>
          <p>Welcome back, {user?.name || 'User'}.</p>
        </div>
        <button className="dashboard-logout" onClick={logout}>Logout</button>
      </section>

      <section className="dashboard-stats">
        <article>
          <span>Total Orders</span>
          <strong>{myOrders.length}</strong>
        </article>
        <article>
          <span>Total Spent</span>
          <strong>${totalSpent.toFixed(2)}</strong>
        </article>
        <article>
          <span>Saved Addresses</span>
          <strong>{user?.addresses?.length || 0}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Profile Settings</h2>
          <form onSubmit={handleSaveProfile} className="stack-form">
            <label>
              Full Name
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
              />
            </label>
            <label>
              Email
              <input type="email" value={user?.email || ''} disabled />
            </label>
            <button type="submit">Save Profile</button>
          </form>
        </article>

        <article className="dashboard-card">
          <h2>Saved Addresses</h2>
          <form onSubmit={handleAddAddress} className="inline-form">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Add a new shipping address"
            />
            <button type="submit">Add</button>
          </form>
          <ul className="address-list">
            {(user?.addresses || []).map((address) => (
              <li key={address}>
                <span>{address}</span>
                <button type="button" onClick={() => removeAddress(address)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dashboard-card orders-card">
        <div className="orders-headline">
          <h2>Order History</h2>
          <Link to="/shop">Continue Shopping</Link>
        </div>

        {myOrders.length === 0 ? (
          <div className="orders-empty">
            <p>You have not placed any orders yet.</p>
            <Link to="/shop">Explore Products</Link>
          </div>
        ) : (
          <div className="orders-list">
            {myOrders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-card-top">
                  <div>
                    <h3>{order.id}</h3>
                    <p>Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <span className="order-status">{order.status || 'confirmed'}</span>
                </div>

                <div className="order-card-meta">
                  <span>{order.items.length} item(s)</span>
                  <strong>${order.total.toFixed(2)}</strong>
                </div>

                {order.discount > 0 ? (
                  <p className="order-discount">
                    Saved ${order.discount.toFixed(2)} {order.promoCode ? `with ${order.promoCode}` : ''}
                  </p>
                ) : null}

                <div className="order-card-actions">
                  <Link to={`/order-confirmation/${order.id}`}>View Details</Link>
                  <button type="button" onClick={() => handleReorder(order.items)}>
                    Reorder Items
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Dashboard;