'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { defaultCatalog, CatalogItem } from '@/utils/fallbackData';
import { useCart } from '@/context/CartContext';
import { CartIcon, SparklesIcon } from '@/components/Icons';

export default function CartPage() {
  const router = useRouter();
  const { cart, changeQty, couponCode, couponApplied, applyCoupon } = useCart();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch catalog to resolve item details
  useEffect(() => {
    async function loadCatalog() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('catalog').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setCatalog(data.map((item: any) => ({
            id: item.id,
            restaurant_id: item.restaurant_id,
            name: item.name,
            desc_text: item.desc_text || item.desc || '',
            price: parseFloat(item.price),
            img: item.img || '/assets/butter_masala.png',
            category: item.category || 'general'
          })));
        } else {
          setCatalog(defaultCatalog);
        }
      } catch (err) {
        setCatalog(defaultCatalog);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Filter items that are currently in the cart
  const cartItems = catalog.filter(item => (cart[item.id] || 0) > 0);

  // Totals calculations
  let subtotal = 0;
  cartItems.forEach(item => {
    const qty = cart[item.id] || 0;
    subtotal += item.price * qty;
  });

  const tax = subtotal * 0.05; // 5% VAT
  const discount = couponApplied ? subtotal * 0.5 : 0;
  const grandTotal = Math.max(0, subtotal + tax - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = applyCoupon(couponInput);
    if (!success && couponInput.trim() !== '') {
      setErrorMsg('Invalid coupon! Try code: SAVE50');
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon('');
    setCouponInput('');
    setErrorMsg('');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '100px 0', alignItems: 'center' }}>
        <div className="admin-pulse" style={{ width: '28px', height: '28px', background: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Preparing checkout basket...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <CartIcon size={64} style={{ color: 'var(--text-muted)' }} />
        <h2 style={{ fontWeight: 800, marginTop: '24px' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px', lineHeight: 1.5 }}>
          Looks like you haven't added anything to your cart yet. Let's find some delicious meals or daily grocery essentials!
        </p>
        <button 
          onClick={() => router.push('/')}
          className="checkout-btn"
          style={{ marginTop: '24px' }}
        >
          Start Browsing
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Shopping Cart</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Review dishes and select checkout options.</p>
      </div>

      <div className="cart-layout">
        
        {/* Left Side: Cart Items Table */}
        <div className="cart-card-container">
          <div className="cart-table-header">
            Selected Items ({cartItems.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cartItems.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-left">
                    <img src={item.img} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-desc">{item.desc_text}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
                        ${item.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="qty-controller">
                    <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>-</button>
                    <span className="qty-count">{qty}</span>
                    <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                  </div>

                  {/* Total item cost */}
                  <div className="cart-item-price-col">
                    ${(item.price * qty).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Order summary & coupon block */}
        <div className="cart-summary-sidebar">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Order Summary</h3>
          
          {/* Coupon Entry */}
          <div className="coupon-section">
            <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Promo Coupon Code</span>
            {!couponApplied ? (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="coupon-input" 
                  placeholder="e.g. SAVE50"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="button" onClick={handleApplyCoupon} className="coupon-btn">Apply</button>
              </form>
            ) : (
              <div className="applied-coupon-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><SparklesIcon size={14} /> Code {couponCode} (50% Off) Active!</span>
                <span className="applied-coupon-remove" onClick={handleRemoveCoupon}>Remove</span>
              </div>
            )}
            {errorMsg && (
              <p style={{ color: '#D32F2F', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>{errorMsg}</p>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Tip: Use <strong style={{ color: 'var(--primary)' }}>SAVE50</strong> coupon code for 50% discount on food subtotal.
            </p>
          </div>

          {/* Price details list */}
          <div className="summary-totals">
            <div className="totals-row">
              <span>Item Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="totals-row">
              <span>Delivery Fee</span>
              <span style={{ color: '#4CAF50', fontWeight: 700 }}>FREE</span>
            </div>

            <div className="totals-row">
              <span>VAT / Service Tax (5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            {couponApplied && (
              <div className="totals-row" style={{ color: '#2E7D32', fontWeight: 600 }}>
                <span>Coupon Discount (50%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="totals-row grand-total">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <Link href="/checkout">
            <button className="checkout-btn">
              Proceed to Checkout {"→"}
            </button>
          </Link>

          <Link href="/" style={{ display: 'block', textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Continue Ordering
          </Link>
        </div>

      </div>
    </div>
  );
}
