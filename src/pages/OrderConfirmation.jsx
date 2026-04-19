import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const getOrderById = useOrderStore((state) => state.getOrderById);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a short loading delay for realism
    const timer = setTimeout(() => {
      const foundOrder = getOrderById(orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <main className="confirmation-main">
        <div className="confirmation-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Processing your order...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="confirmation-main">
        <div className="confirmation-container">
          <div className="error-state">
            <h2>Order Not Found</h2>
            <p>We couldn't find the order you're looking for.</p>
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="confirmation-main">
      <div className="confirmation-container">
        {/* Success Message */}
        <div className="confirmation-header">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>

        {/* Order Number */}
        <div className="order-number-card">
          <div className="order-number">
            <span className="label">Order Number</span>
            <span className="number">{order.id}</span>
          </div>
          <div className="order-date">
            <span className="label">Order Date</span>
            <span className="date">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Important Information */}
        <div className="info-banner">
          <strong>A confirmation email has been sent to {order.customerEmail}</strong>
          <p>You'll receive tracking information via email once your order ships.</p>
        </div>

        {/* Order Details */}
        <div className="order-details">
          {/* Items */}
          <section className="detail-section">
            <h2>Order Items</h2>
            <div className="items-list">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>
                  <div className="item-qty">Qty: {item.quantity}</div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping Address */}
          <section className="detail-section">
            <h2>Shipping Address</h2>
            <div className="address-box">
              <p>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.streetAddress}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="contact">{order.shippingAddress.email}</p>
              <p className="contact">{order.shippingAddress.phone}</p>
            </div>
          </section>

          {/* Shipping & Payment Methods */}
          <div className="methods-row">
            <section className="detail-section">
              <h2>Shipping Method</h2>
              <div className="method-box">
                <p>
                  {order.shippingMethod === 'standard' &&
                    'Standard Shipping (5-7 business days)'}
                  {order.shippingMethod === 'express' &&
                    'Express Shipping (2-3 business days)'}
                  {order.shippingMethod === 'overnight' &&
                    'Overnight Shipping (Next business day)'}
                </p>
              </div>
            </section>

            <section className="detail-section">
              <h2>Payment Method</h2>
              <div className="method-box">
                <p>
                  Card ending in <strong>{order.paymentInfo.cardLast4}</strong>
                </p>
                <p className="cardholder">{order.paymentInfo.cardName}</p>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <section className="detail-section summary-section">
            <h2>Order Summary</h2>
            <div className="summary-table">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 ? (
                <div className="summary-row discount">
                  <span>Promo {order.promoCode ? `(${order.promoCode})` : ''}</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="summary-row">
                <span>Shipping</span>
                <span>${(order.discountedShipping ?? order.shippingCost).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h2>What's Next?</h2>
          <ul>
            <li>We'll send you a confirmation email shortly</li>
            <li>Track your order status at any time in your account</li>
            <li>Expect your package in {order.shippingMethod === 'standard' ? '5-7' : order.shippingMethod === 'express' ? '2-3' : '1'} business days</li>
            <li>Have questions? Check our FAQ or contact support</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            View Order in Account
          </button>
          <button className="btn-secondary" onClick={() => navigate('/shop')}>
            Continue Shopping
          </button>
        </div>

        {/* Footer Note */}
        <div className="confirmation-footer">
          <p>
            Need help? Email us at <strong>support@modernstore.com</strong> or call{' '}
            <strong>1-800-MOD-STORE</strong>
          </p>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
