import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { useCartStore, selectCartSubtotal } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';
import { evaluatePromo } from '../utils/promo';
import './Checkout.css';

// Zod validation schemas
const addressSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
  country: z.string().min(2, 'Country is required'),
});

const paymentSchema = z.object({
  cardName: z.string().min(3, 'Cardholder name is required'),
  cardNumber: z
    .string()
    .refine((value) => /^\d{16}$/.test(value.replace(/\s/g, '')), 'Card number must be 16 digits'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVC must be 3-4 digits'),
});

const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Standard Shipping (5-7 business days)',
    cost: 5.99,
    description: 'Most affordable option',
  },
  {
    id: 'express',
    name: 'Express Shipping (2-3 business days)',
    cost: 14.99,
    description: 'Faster delivery',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping (Next business day)',
    cost: 29.99,
    description: 'Arrives tomorrow',
  },
];

const TAX_RATE = 0.1; // 10% tax

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_ORDER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID;
const EMAILJS_AUTOREPLY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const formatOrderItemsForEmail = (items = []) => {
  if (!items.length) return 'No items in order.';

  return items
    .map((item, index) => {
      const unitPrice = Number(item.price || 0);
      const quantity = Number(item.quantity || 1);
      const lineTotal = unitPrice * quantity;
      const sizePart = item.size ? ` | Size: ${item.size}` : '';
      const colorPart = item.color ? ` | Color: ${item.color}` : '';

      return `${index + 1}. ${item.name} | Qty: ${quantity}${sizePart}${colorPart} | Unit: $${unitPrice.toFixed(2)} | Line Total: $${lineTotal.toFixed(2)}`;
    })
    .join('\n');
};

const sendOrderEmails = async ({ orderId, address, itemsList, total }) => {
  if (
    !EMAILJS_SERVICE_ID ||
    !EMAILJS_ORDER_TEMPLATE_ID ||
    !EMAILJS_AUTOREPLY_TEMPLATE_ID ||
    !EMAILJS_PUBLIC_KEY
  ) {
    console.warn(
      'EmailJS env vars missing. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_ORDER_TEMPLATE_ID, VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY.'
    );
    return;
  }

  const customerName = `${address?.firstName || ''} ${address?.lastName || ''}`.trim() || 'Customer';
  const templateParams = {
    order_id: orderId,
    customer_name: customerName,
    customer_email: address?.email || '',
    items_list: itemsList,
    total_price: `$${Number(total || 0).toFixed(2)}`,
  };

  await Promise.allSettled([
    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_ORDER_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    ),
    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_AUTOREPLY_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    ),
  ]);
};

const Checkout = () => {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const cartSubtotal = useCartStore(selectCartSubtotal);
  const promoCode = useCartStore((state) => state.promoCode);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addAddress = useAuthStore((state) => state.addAddress);
  const addOrderReference = useAuthStore((state) => state.addOrderReference);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [addressData, setAddressData] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);

  const createOrder = useOrderStore((state) => state.createOrder);
  const clearCart = useCartStore((state) => state.clearCart);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  // Address form
  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
  });

  // Payment form
  const paymentForm = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  // Validate steps
  const handleAddressSubmit = async (data) => {
    setAddressData(data);
    setCurrentStep(2);
  };

  const handleShippingSubmit = () => {
    setCurrentStep(3);
  };

  const handlePaymentSubmit = async () => {
    const isPaymentValid = await paymentForm.trigger();
    if (!isPaymentValid) return;
    setCurrentStep(4);
  };

  const getShippingCost = () => {
    const method = SHIPPING_METHODS.find((m) => m.id === shippingMethod);
    return method ? method.cost : 0;
  };

  const calculateTotals = () => {
    const subtotal = cartSubtotal;
    const shipping = getShippingCost();
    const promo = evaluatePromo({ code: promoCode, subtotal, shippingCost: shipping });
    const discountedSubtotal = Math.max(0, subtotal - promo.itemDiscount);
    const discountedShipping = Math.max(0, shipping - promo.shippingDiscount);
    const tax = discountedSubtotal * TAX_RATE;
    const total = discountedSubtotal + discountedShipping + tax;
    return {
      subtotal,
      shipping,
      tax,
      total,
      promo,
      discountedSubtotal,
      discountedShipping,
    };
  };

  const {
    subtotal,
    shipping,
    tax,
    total,
    promo,
    discountedSubtotal,
    discountedShipping,
  } = calculateTotals();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentStep]);

  useEffect(() => {
    if (!orderPlaced || !newOrderId) return;

    // Keep user at the top so the success animation is always visible.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const timer = setTimeout(() => {
      navigate('/');
    }, 2200);

    return () => clearTimeout(timer);
  }, [orderPlaced, newOrderId, navigate]);

  const handlePlaceOrder = async () => {
    const orderItemsSummary = formatOrderItemsForEmail(cartItems);

    // Create order
    const orderId = createOrder({
      items: cartItems,
      orderItemsSummary,
      subtotal,
      shippingCost: shipping,
      tax,
      total,
      shippingMethod,
      shippingAddress: addressData,
      paymentInfo: {
        cardLast4: paymentForm.getValues('cardNumber').replace(/\s/g, '').slice(-4),
        cardName: paymentForm.getValues('cardName'),
      },
      promoCode: promo.isValid ? promo.code : '',
      promoLabel: promo.isValid ? promo.label : '',
      discount: promo.totalDiscount,
      itemDiscount: promo.itemDiscount,
      shippingDiscount: promo.shippingDiscount,
      discountedSubtotal,
      discountedShipping,
      customerEmail: addressData.email,
      status: 'confirmed',
    });

    await sendOrderEmails({
      orderId,
      address: addressData,
      itemsList: orderItemsSummary,
      total,
    });

    setNewOrderId(orderId);
    setOrderPlaced(true);
    addOrderReference(orderId);
    if (addressData?.streetAddress) {
      addAddress(`${addressData.streetAddress}, ${addressData.city}, ${addressData.state} ${addressData.zipCode}`);
    }
    clearCart();
    setCartOpen(false);
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const buttonLabelExpire = (str) => {
    if (!str) return '';
    const cleaned = str.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 4; i++) {
      if (i === 2) formatted += '/';
      formatted += cleaned[i];
    }
    return formatted;
  };

  const formatCardNumber = (str) => {
    if (!str) return '';
    const cleaned = str.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  if (!isAuthenticated && currentStep > 1) {
    return (
      <main style={{ padding: '110px 5% 60px' }}>
        <div className="checkout-container">
          <div className="auth-required">
            <h2>Authentication Required</h2>
            <p>Please log in to proceed with checkout.</p>
            <div className="auth-required-buttons">
              <button
                className="btn-primary"
                onClick={() => navigate('/login', { state: { from: '/checkout' } })}
              >
                Log In
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate('/signup', { state: { from: '/checkout' } })}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <main style={{ padding: '110px 5% 60px' }}>
        <div className="checkout-container">
          <div className="empty-cart">
            <h2>Your Cart is Empty</h2>
            <p>Add items to your cart before checking out.</p>
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="checkout-main checkout-success-main">
        <div className="checkout-container">
          <div className="order-success-state">
            <div className="success-checkmark" aria-hidden="true">
              <svg viewBox="0 0 52 52">
                <circle className="check-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="check-mark" fill="none" d="M14 27l7 7 17-17" />
              </svg>
            </div>
            <h2>Order Placed Successfully</h2>
            <p>Your order has been confirmed and your cart is now empty.</p>
            {newOrderId ? <p className="order-id-note">Order ID: {newOrderId}</p> : null}
            <p className="redirect-note">Redirecting to home...</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Go To Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-main">
      <div className="checkout-wrapper">
        {/* Progress indicator */}
        <div className="checkout-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Address</div>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Shipping</div>
          </div>
          <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Payment</div>
          </div>
          <div className={`progress-line ${currentStep >= 4 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Review</div>
          </div>
        </div>

        <div className="checkout-content">
          {/* Step 1: Shipping Address */}
          {currentStep === 1 && (
            <div className="checkout-step">
              <h2>Shipping Address</h2>
              <form
                onSubmit={addressForm.handleSubmit(handleAddressSubmit)}
                className="checkout-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      {...addressForm.register('firstName')}
                      placeholder="John"
                      type="text"
                    />
                    {addressForm.formState.errors.firstName && (
                      <span className="error-text">
                        {addressForm.formState.errors.firstName.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      {...addressForm.register('lastName')}
                      placeholder="Doe"
                      type="text"
                    />
                    {addressForm.formState.errors.lastName && (
                      <span className="error-text">
                        {addressForm.formState.errors.lastName.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Email *</label>
                  <input
                    {...addressForm.register('email')}
                    placeholder="john@example.com"
                    type="email"
                  />
                  {addressForm.formState.errors.email && (
                    <span className="error-text">
                      {addressForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Phone Number *</label>
                  <input
                    {...addressForm.register('phone')}
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                  />
                  {addressForm.formState.errors.phone && (
                    <span className="error-text">
                      {addressForm.formState.errors.phone.message}
                    </span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Street Address *</label>
                  <input
                    {...addressForm.register('streetAddress')}
                    placeholder="123 Main Street"
                    type="text"
                  />
                  {addressForm.formState.errors.streetAddress && (
                    <span className="error-text">
                      {addressForm.formState.errors.streetAddress.message}
                    </span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      {...addressForm.register('city')}
                      placeholder="New York"
                      type="text"
                    />
                    {addressForm.formState.errors.city && (
                      <span className="error-text">
                        {addressForm.formState.errors.city.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      {...addressForm.register('state')}
                      placeholder="NY"
                      type="text"
                    />
                    {addressForm.formState.errors.state && (
                      <span className="error-text">
                        {addressForm.formState.errors.state.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Zip Code *</label>
                    <input
                      {...addressForm.register('zipCode')}
                      placeholder="10001"
                      type="text"
                    />
                    {addressForm.formState.errors.zipCode && (
                      <span className="error-text">
                        {addressForm.formState.errors.zipCode.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Country *</label>
                  <select {...addressForm.register('country')}>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                  {addressForm.formState.errors.country && (
                    <span className="error-text">
                      {addressForm.formState.errors.country.message}
                    </span>
                  )}
                </div>

                <button type="submit" className="btn-primary btn-full">
                  Continue to Shipping
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Shipping Method */}
          {currentStep === 2 && (
            <div className="checkout-step">
              <h2>Shipping Method</h2>
              <div className="shipping-methods">
                {SHIPPING_METHODS.map((method) => (
                  <label key={method.id} className="shipping-option">
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <div className="shipping-details">
                      <div className="shipping-name">{method.name}</div>
                      <div className="shipping-description">{method.description}</div>
                    </div>
                    <div className="shipping-cost">${method.cost.toFixed(2)}</div>
                  </label>
                ))}
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={handleStepBack}>
                  Back
                </button>
                <button className="btn-primary" onClick={handleShippingSubmit}>
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Information */}
          {currentStep === 3 && (
            <div className="checkout-step">
              <h2>Payment Information</h2>
              <form className="checkout-form">
                <div className="form-group full-width">
                  <label>Cardholder Name *</label>
                  <input
                    {...paymentForm.register('cardName')}
                    placeholder="John Doe"
                    type="text"
                  />
                  {paymentForm.formState.errors.cardName && (
                    <span className="error-text">
                      {paymentForm.formState.errors.cardName.message}
                    </span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Card Number *</label>
                  <input
                    {...paymentForm.register('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    type="text"
                    maxLength="19"
                    onInput={(e) => {
                      e.target.value = formatCardNumber(e.target.value);
                    }}
                  />
                  {paymentForm.formState.errors.cardNumber && (
                    <span className="error-text">
                      {paymentForm.formState.errors.cardNumber.message}
                    </span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date (MM/YY) *</label>
                    <input
                      {...paymentForm.register('expiryDate')}
                      placeholder="12/25"
                      type="text"
                      maxLength="5"
                      onInput={(e) => {
                        e.target.value = buttonLabelExpire(e.target.value);
                      }}
                    />
                    {paymentForm.formState.errors.expiryDate && (
                      <span className="error-text">
                        {paymentForm.formState.errors.expiryDate.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>CVC *</label>
                    <input
                      {...paymentForm.register('cvc')}
                      placeholder="123"
                      type="text"
                      maxLength="4"
                    />
                    {paymentForm.formState.errors.cvc && (
                      <span className="error-text">
                        {paymentForm.formState.errors.cvc.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="payment-note">
                  <p>
                    💡 For testing, use card number: <strong>4532 1488 0343 6467</strong>
                  </p>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleStepBack}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handlePaymentSubmit}
                  >
                    Review Order
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Order Review */}
          {currentStep === 4 && (
            <div className="checkout-step">
              <h2>Order Review</h2>

              <div className="review-section">
                <h3>Shipping Address</h3>
                <div className="review-content">
                  <p>
                    {addressData?.firstName} {addressData?.lastName}
                  </p>
                  <p>{addressData?.streetAddress}</p>
                  <p>
                    {addressData?.city}, {addressData?.state} {addressData?.zipCode}
                  </p>
                  <p>{addressData?.country}</p>
                  <p>{addressData?.email}</p>
                  <button
                    className="review-edit-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="review-section">
                <h3>Shipping Method</h3>
                <div className="review-content">
                  <p>
                    {
                      SHIPPING_METHODS.find((m) => m.id === shippingMethod)
                        ?.name
                    }
                  </p>
                  <button
                    className="review-edit-btn"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="review-section">
                <h3>Items ({cartItems.length})</h3>
                <div className="review-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="review-item">
                      <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                      <div>
                        <div className="item-name">{item.name}</div>
                        <div className="item-qty">Qty: {item.quantity}</div>
                      </div>
                      <div className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {promo.totalDiscount > 0 ? (
                  <div className="summary-row discount">
                    <span>Promo ({promo.code})</span>
                    <span>- ${promo.totalDiscount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>${discountedShipping.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleStepBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary btn-full"
                  onClick={handlePlaceOrder}
                  disabled={orderPlaced}
                >
                  {orderPlaced ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {currentStep < 4 && (
          <aside className="checkout-sidebar">
            <div className="sidebar-summary">
              <h3>Order Summary</h3>

              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div>
                      <div>{item.name}</div>
                      <div className="item-qty">x{item.quantity}</div>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {promo.totalDiscount > 0 ? (
                <div className="summary-row discount">
                  <span>Promo ({promo.code})</span>
                  <span>- ${promo.totalDiscount.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="summary-row">
                <span>Shipping</span>
                <span>${discountedShipping.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
};

export default Checkout;