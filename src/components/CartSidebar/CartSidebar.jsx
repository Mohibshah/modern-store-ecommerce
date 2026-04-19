import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  selectCartSubtotal,
  useCartStore,
} from '../../store/useCartStore';
import { evaluatePromo, normalizePromoCode, PROMO_CODES } from '../../utils/promo';
import './CartSidebar.css';

const CartSidebar = () => {
  const cartOpen = useCartStore((state) => state.cartOpen);
  const items = useCartStore((state) => state.items);
  const promoCode = useCartStore((state) => state.promoCode);
  const setPromoCode = useCartStore((state) => state.setPromoCode);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore(selectCartSubtotal);
  const promoResult = evaluatePromo({ code: promoCode, subtotal, shippingCost: 0 });

  const estimatedTotal = Math.max(0, subtotal - promoResult.itemDiscount);

  return (
    <AnimatePresence>
      {cartOpen ? (
        <>
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="cart-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="cart-header">
              <h3>Your Cart</h3>
              <button onClick={() => setCartOpen(false)} type="button">✕</button>
            </div>

            <div className="cart-items">
              {items.length === 0 ? (
                <p className="cart-empty">Your cart is empty.</p>
              ) : (
                items.map((item) => (
                  <article key={item.id} className="cart-row">
                    <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                    <div>
                      <h4>{item.name}</h4>
                      <p>${item.price}</p>
                      <div className="qty-controls">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className="remove-btn" type="button" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </article>
                ))
              )}
            </div>

            <div className="cart-footer">
              <label>
                Promo Code
                <input
                  type="text"
                  placeholder="e.g. REACT20"
                  value={promoCode}
                  onChange={(e) => setPromoCode(normalizePromoCode(e.target.value))}
                />
              </label>
              {promoCode ? (
                <p className={`promo-status ${promoResult.isValid ? 'valid' : 'invalid'}`}>
                  {promoResult.message}
                </p>
              ) : null}
              <p className="promo-hints">
                Try: {PROMO_CODES.map((promo) => promo.code).join(', ')}
              </p>
              <p className="subtotal">Subtotal: ${subtotal.toFixed(2)}</p>
              {promoResult.itemDiscount > 0 ? (
                <p className="discount-line">Discount: -${promoResult.itemDiscount.toFixed(2)}</p>
              ) : null}
              <p className="estimated-total">Estimated Total: ${estimatedTotal.toFixed(2)}</p>
              <div className="cart-actions">
                <button className="ghost-btn" type="button" onClick={clearCart}>Clear Cart</button>
                <Link className="primary-btn" to="/checkout" onClick={() => setCartOpen(false)}>
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default CartSidebar;