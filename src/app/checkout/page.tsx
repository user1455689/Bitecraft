'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { defaultCatalog, CatalogItem } from '@/utils/fallbackData';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { MapPinIcon, PlusIcon } from '@/components/Icons';
import MapSelector from '@/components/MapSelector';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, couponCode, couponApplied, clearCart } = useCart();
  const { user, address, phone, savedAddresses, updateAddress, addAddress, updatePhone, setActiveOrderId } = useUser();

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState(address);
  const [phoneInput, setPhoneInput] = useState(phone);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  
  // Modal for new address
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

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

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddressInput.trim() !== '') {
      addAddress(newAddressInput.trim());
      setSelectedAddress(newAddressInput.trim());
      updateAddress(newAddressInput.trim());
      setNewAddressInput('');
      setShowAddressModal(false);
    }
  };

  const handleMapConfirmAddress = (fullAddressText: string, lat: number, lng: number) => {
    const gpsAddressString = `${fullAddressText} [GPS: ${lat},${lng}]`;
    addAddress(gpsAddressString);
    setSelectedAddress(gpsAddressString);
    updateAddress(gpsAddressString);
    setShowMap(false);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setPlacingOrder(true);

    const orderId = 'BC-' + Math.floor(1000 + Math.random() * 9000);
    const orderItemsList = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      qty: cart[item.id],
      price: item.price
    }));

    // Save active address & phone to User Context
    updateAddress(selectedAddress);
    updatePhone(phoneInput);

    // 1. Try saving order to Supabase
    try {
      const supabase = createClient();
      
      const { error: orderErr } = await supabase.from('orders').insert({
        id: orderId,
        customer_name: user.name,
        address: selectedAddress,
        phone: phoneInput,
        subtotal: subtotal,
        discount: discount,
        total: grandTotal,
        payment_method: paymentMethod,
        status: 'Pending'
      });

      if (orderErr) throw orderErr;

      const itemInserts = orderItemsList.map(item => ({
        order_id: orderId,
        item_id: item.id,
        qty: item.qty,
        price: item.price
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemInserts);
      if (itemsErr) throw itemsErr;

      console.log('Order successfully inserted into Supabase.');
    } catch (err) {
      console.warn('Failed to insert order in Supabase. Using localStorage fallback.', err);
    }

    // 2. Local Storage Order History Logging (always back up)
    const localOrderObject = {
      id: orderId,
      customerName: user.name,
      address: selectedAddress,
      phone: phoneInput,
      items: orderItemsList,
      subtotal,
      discount,
      total: grandTotal,
      paymentMethod,
      status: 'Pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };

    const savedOrdersStr = localStorage.getItem('bitecraft_orders_history') || '[]';
    try {
      const savedOrders = JSON.parse(savedOrdersStr);
      savedOrders.unshift(localOrderObject);
      localStorage.setItem('bitecraft_orders_history', JSON.stringify(savedOrders));
    } catch (e) {}

    // Save active tracking order id
    setActiveOrderId(orderId);

    // 3. Compile WhatsApp message format
    const targetPhone = "9779746571404";
    let msg = `*New Order from BiteCraft!*\n`;
    msg += `------------------------------\n`;
    msg += `*Order ID:* ${orderId}\n`;
    msg += `*Customer Name:* ${user.name}\n`;
    msg += `*Phone:* ${phoneInput}\n`;
    msg += `*Delivery Address:* ${selectedAddress}\n`;
    msg += `*Payment Method:* ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Paid Online (Card)'}\n\n`;
    msg += `*Items List:*\n`;
    orderItemsList.forEach(item => {
      msg += `• ${item.qty}x ${item.name} ($${item.price.toFixed(2)} each)\n`;
    });
    msg += `\n`;
    msg += `*Item Subtotal:* $${subtotal.toFixed(2)}\n`;
    msg += `*VAT / Service Tax:* $${tax.toFixed(2)}\n`;
    if (couponApplied) {
      msg += `*Coupon Discount:* -$${discount.toFixed(2)}\n`;
    }
    msg += `*Grand Total:* *$${grandTotal.toFixed(2)}*\n`;
    msg += `------------------------------\n`;
    msg += `_Sent via Next.js Supabase App_`;

    // WhatsApp Direct Link
    const waLink = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    
    // Clear cart context
    clearCart();

    // Open WhatsApp
    window.open(waLink, '_blank');

    // Route to order-tracking
    router.push(`/order-tracking/${orderId}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '100px 0', alignItems: 'center' }}>
        <div className="admin-pulse" style={{ width: '28px', height: '28px', background: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Preparing checkout details...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Checkout Order</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select your delivery details and payment preferences.</p>
        </div>

        <div className="cart-layout">
          
          {/* Left Columns - Address, Phone and Payments */}
          <div>
            {/* Address Section */}
            <div className="checkout-section-box">
              <h3 className="checkout-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPinIcon size={18} /> 1. Delivery Address
              </h3>
              
              <div className="checkout-address-list">
                {savedAddresses.map((addr, idx) => {
                  const displayText = addr.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, '');
                  const hasGps = addr.includes('[GPS:');
                  return (
                    <label 
                      key={idx} 
                      className={`address-option-label ${selectedAddress === addr ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="addressRadio"
                        className="address-option-radio"
                        checked={selectedAddress === addr}
                        onChange={() => setSelectedAddress(addr)}
                      />
                      <div className="address-option-details" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span className="address-option-title">
                            Address Option {idx + 1}
                          </span>
                          {hasGps && (
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPinIcon size={10} /> Map Pinned
                            </span>
                          )}
                        </div>
                        <span className="address-option-text">
                          {displayText}
                        </span>
                      </div>
                    </label>
                  );
                })}

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <button 
                    type="button" 
                    className="add-address-trigger"
                    onClick={() => setShowAddressModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <PlusIcon size={12} /> Enter Address Text
                  </button>

                  <button 
                    type="button" 
                    className="add-address-trigger"
                    onClick={() => setShowMap(true)}
                    style={{ color: '#1976D2', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <MapPinIcon size={12} /> Select on Interactive Map
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="checkout-section-box">
              <h3 className="checkout-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 2. Contact Phone Number
              </h3>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone for Delivery Updates</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={phoneInput} 
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Enter 10-digit phone number"
                />
              </div>
            </div>

            {/* Payment Option */}
            <div className="checkout-section-box">
              <h3 className="checkout-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> 3. Select Payment Method
              </h3>
              
              <div className="payment-grid">
                <div 
                  className={`payment-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="payment-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                  </div>
                  <div className="payment-title">Cash on Delivery (COD)</div>
                  <div className="payment-desc">Pay by Cash or scan QR code when your rider arrives.</div>
                </div>

                <div 
                  className={`payment-card ${paymentMethod === 'Online' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Online')}
                >
                  <div className="payment-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <div className="payment-title">Online Payment</div>
                  <div className="payment-desc">We support Visa, Mastercard, and Mobile Wallets.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Brief summary and place order action */}
          <div className="cart-summary-sidebar">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Summary Basket</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {cart[item.id]}x {item.name}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ${(item.price * cart[item.id]).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-totals" style={{ padding: '16px 0 0 0', marginBottom: '20px' }}>
              <div className="totals-row">
                <span>Items Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="totals-row">
                <span>Delivery Charges</span>
                <span style={{ color: '#4CAF50', fontWeight: 700 }}>FREE</span>
              </div>

              <div className="totals-row">
                <span>VAT / Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              {couponApplied && (
                <div className="totals-row" style={{ color: '#2E7D32', fontWeight: 600 }}>
                  <span>Coupon Applied</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="totals-row grand-total" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                <span>Payable Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="button" 
              className="checkout-btn"
              disabled={placingOrder}
              onClick={handlePlaceOrder}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {placingOrder ? (
                <>
                  <div className="admin-pulse" style={{ width: '12px', height: '12px', background: 'white' }}></div>
                  Creating Order...
                </>
              ) : (
                `Place Order ($${grandTotal.toFixed(2)})`
              )}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: 1.4 }}>
              Clicking Place Order opens your order receipt in WhatsApp to finalize delivery dispatch tracking.
            </p>
          </div>

        </div>

        {/* Add Address Modal Box */}
        {showAddressModal && (
          <div className="modal-backdrop">
            <div className="modal-container">
              <div className="modal-header">
                <span className="modal-title">Add New Address</span>
                <button className="modal-close-btn" onClick={() => setShowAddressModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddNewAddress}>
                  <div className="form-group">
                    <label className="form-label">Full Location Address Details</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Enter street, city, postal code..."
                      value={newAddressInput}
                      onChange={(e) => setNewAddressInput(e.target.value)}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn" style={{ width: '100%' }}>
                    Save & Select Address
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map selector modal */}
      {showMap && (
        <MapSelector
          onClose={() => setShowMap(false)}
          onConfirm={handleMapConfirmAddress}
        />
      )}
    </>
  );
}
