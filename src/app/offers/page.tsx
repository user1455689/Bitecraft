'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { GiftIcon, SparklesIcon } from '@/components/Icons';

export default function OffersPage() {
  const { applyCoupon, couponCode, couponApplied } = useCart();
  const [toastMsg, setToastMsg] = useState('');

  const coupons = [
    {
      code: 'SAVE50',
      title: 'Flat 50% Off Everything',
      desc: 'Get half price discount on items subtotal. Valid for all foods and groceries in catalog.',
      terms: 'Minimum subtotal of $5.00 required. Max discount up to $100.00.'
    },
    {
      code: 'WELCOME100',
      title: 'First Order Special Freebie',
      desc: 'Free butter naan or organic milk loaf on your first checkout over $15.',
      terms: 'Only applicable for new users on their first order transaction.'
    },
    {
      code: 'FREESHIP',
      title: 'Zero Delivery Fees Everyday',
      desc: 'We are already offering 100% free delivery across all restaurants and groceries!',
      terms: 'No code required. Automatically applied to all checkout summaries.'
    }
  ];

  const handleApply = (code: string) => {
    if (code === 'FREESHIP') {
      setToastMsg('Free delivery is automatically applied at checkout!');
      setTimeout(() => setToastMsg(''), 2500);
      return;
    }

    const success = applyCoupon(code);
    if (success) {
      setToastMsg(`Coupon "${code}" applied successfully to your cart!`);
    } else {
      setToastMsg('Failed to apply coupon.');
    }
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Deals & Coupons</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Save big on food orders and grocery delivery bills with active discounts.</p>
      </div>

      <div className="offers-grid">
        {coupons.map((coupon, idx) => {
          const isActive = couponCode === coupon.code && couponApplied;
          return (
            <div key={idx} className="offer-card" style={{
              background: isActive 
                ? 'linear-gradient(135deg, #2E7D32, #4CAF50)' 
                : 'linear-gradient(135deg, var(--primary), var(--accent))'
            }}>
              <h3 className="offer-title">{coupon.title}</h3>
              <p className="offer-desc">{coupon.desc}</p>
              
              <div className="offer-code-row">
                <span className="offer-code">{coupon.code}</span>
                <button 
                  onClick={() => handleApply(coupon.code)}
                  className="offer-apply-btn"
                  style={{ color: isActive ? '#2E7D32' : 'var(--primary)' }}
                >
                  {isActive ? 'Applied ✓' : 'Apply Code'}
                </button>
              </div>

              <p style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '12px' }}>
                * Terms: {coupon.terms}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '40px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <GiftIcon size={40} style={{ color: 'var(--primary)' }} />
        <h4 style={{ fontWeight: 700, marginTop: '10px' }}>Looking for custom discounts?</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Keep checking our offers page or sign up for notifications to receive personalized codes direct to your email inbox!</p>
        <Link href="/profile">
          <button className="checkout-btn" style={{ marginTop: '16px', width: 'auto', padding: '8px 24px', fontSize: '0.85rem' }}>
            Update Profile Notifications
          </button>
        </Link>
      </div>

      {/* Toast Notifier */}
      {toastMsg && (
        <div className="toast-msg" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <SparklesIcon size={14} /> {toastMsg}
        </div>
      )}
    </div>
  );
}
