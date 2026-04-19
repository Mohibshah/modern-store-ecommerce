import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';

const Wishlist = () => {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);

  return (
    <main style={{ padding: '110px 5% 60px' }}>
      <h1>Wishlist</h1>
      {items.length === 0 ? (
        <p>Your wishlist is empty. <Link to="/shop">Browse products</Link></p>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {items.map((item) => (
            <article key={item.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 12, border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, background: 'var(--surface)' }}>
              <img src={item.image} alt={item.name} loading="lazy" decoding="async" style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover' }} />
              <div>
                <h3 style={{ margin: 0 }}>{item.name}</h3>
                <p style={{ margin: '6px 0', color: 'var(--muted-text)' }}>${item.price}</p>
              </div>
              <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
                <button
                  style={{ border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}
                  onClick={(e) => addItem(item, 1, { sourceX: e.clientX, sourceY: e.clientY })}
                >
                  Add to Cart
                </button>
                <button style={{ border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }} onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default Wishlist;