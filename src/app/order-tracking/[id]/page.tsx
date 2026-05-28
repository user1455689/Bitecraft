'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { SearchIcon } from '@/components/Icons';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: string; // 'Pending', 'Preparing', 'Out for Delivery', 'Delivered'
  timestamp: string;
  paymentMethod?: string;
  date?: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Load order and listen to changes
  useEffect(() => {
    const supabase = createClient();

    async function loadOrder() {
      try {
        // Fetch order details
        const { data: orderRow, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderErr) throw orderErr;

        if (orderRow) {
          setSupabaseConnected(true);
          
          // Fetch order items
          const { data: itemRows } = await supabase
            .from('order_items')
            .select('qty, price, catalog(name)')
            .eq('order_id', orderId);

          const items: OrderItem[] = (itemRows || []).map((ir: any) => ({
            id: ir.item_id || "",
            name: ir.catalog?.name || "Dish Item",
            qty: ir.qty,
            price: parseFloat(ir.price)
          }));

          setOrder({
            id: orderRow.id,
            customerName: orderRow.customer_name,
            address: orderRow.address,
            phone: orderRow.phone,
            items: items,
            subtotal: parseFloat(orderRow.subtotal || 0),
            discount: parseFloat(orderRow.discount || 0),
            total: parseFloat(orderRow.total),
            status: orderRow.status,
            paymentMethod: orderRow.payment_method || 'COD',
            timestamp: new Date(orderRow.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(orderRow.created_at).toLocaleDateString()
          });
        } else {
          // Check local fallback
          loadLocalOrder();
        }
      } catch (err) {
        console.log("Supabase fetch failed for tracking, searching local fallback.", err);
        loadLocalOrder();
      } finally {
        setLoading(false);
      }
    }

    function loadLocalOrder() {
      const historyStr = localStorage.getItem('bitecraft_orders_history') || '[]';
      try {
        const historyList = JSON.parse(historyStr) as Order[];
        const matched = historyList.find(o => o.id === orderId);
        if (matched) {
          setOrder(matched);
        }
      } catch (e) {
        console.error('Error loading local order history', e);
      }
    }

    if (orderId) {
      loadOrder();

      // Realtime subscription specifically for this order!
      const channel = supabase
        .channel(`order-track-${orderId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => {
            console.log('Realtime order update received:', payload.new);
            const row = payload.new;
            setOrder(prev => {
              if (!prev) return null;
              return {
                ...prev,
                status: row.status
              };
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '100px 0', alignItems: 'center' }}>
        <div className="admin-pulse" style={{ width: '28px', height: '28px', background: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Locating active GPS dispatch details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <SearchIcon size={64} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ fontWeight: 800, marginTop: '20px' }}>Order not found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
          We could not find order number "{orderId}" in database tables. Let's find your order in profile history or place a new order.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
          <button onClick={() => router.push('/')} className="checkout-btn" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            Go Home
          </button>
          <button onClick={() => router.push('/profile')} className="checkout-btn" style={{ background: 'var(--text-main)', padding: '10px 20px', fontSize: '0.9rem' }}>
            Check History
          </button>
        </div>
      </div>
    );
  }

  // Active status progress mapping
  const statuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
  const activeIdx = statuses.indexOf(order.status);

  // Status visual configurations
  const statusDetails = {
    Pending: { title: 'Order Confirmed', desc: 'The outlet is reviewing and confirming your order.', time: 'Arriving in 35-45 mins' },
    Preparing: { title: 'Preparing Food', desc: 'The chef is preparing your meal using fresh ingredients.', time: 'Arriving in 25-35 mins' },
    'Out for Delivery': { title: 'Out for Delivery', desc: 'Our rider is speeding to your location with hot packaging.', time: 'Arriving in 5-15 mins' },
    Delivered: { title: 'Order Delivered', desc: 'Enjoy your food! Let us know how your delivery went.', time: 'Delivered successfully' }
  };

  const currentDetails = statusDetails[order.status as keyof typeof statusDetails] || {
    title: 'Processing Order',
    desc: 'We are processing your order updates.',
    time: 'Preparing food'
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      
      <div className="tracking-wrapper">
        
        {/* Header summary */}
        <div className="tracking-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Delivery Order</span>
            {supabaseConnected && (
              <span style={{ fontSize: '0.75rem', color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <span className="admin-pulse" style={{ background: '#4CAF50', width: '8px', height: '8px' }}></span> Live Supabase Synced
              </span>
            )}
          </div>
          <h2 className="tracking-id">ID: {order.id}</h2>
          <div className="tracking-est-time">{currentDetails.time}</div>
          <p className="tracking-desc">{currentDetails.desc}</p>
        </div>

        {/* Live Timeline Nodes */}
        <div className="tracking-timeline">
          
          <div className={`tracking-step ${activeIdx >= 0 ? (activeIdx === 0 ? 'active' : 'completed') : ''}`}>
            <div className="tracking-node"></div>
            <span className="tracking-title">Order Received</span>
            <span className="tracking-summary">Awaiting restaurant review and kitchen approval.</span>
          </div>

          <div className={`tracking-step ${activeIdx >= 1 ? (activeIdx === 1 ? 'active' : 'completed') : ''}`}>
            <div className="tracking-node"></div>
            <span className="tracking-title">Preparing Meals</span>
            <span className="tracking-summary">Food is being prepared and packed fresh.</span>
          </div>

          <div className={`tracking-step ${activeIdx >= 2 ? (activeIdx === 2 ? 'active' : 'completed') : ''}`}>
            <div className="tracking-node"></div>
            <span className="tracking-title">Out for Delivery</span>
            <span className="tracking-summary">Rider has picked up packages and is heading your way.</span>
          </div>

          <div className={`tracking-step ${activeIdx >= 3 ? (activeIdx === 3 ? 'active' : 'completed') : ''}`}>
            <div className="tracking-node"></div>
            <span className="tracking-title">Arrived & Delivered</span>
            <span className="tracking-summary">Delivered at door. Thank you for ordering!</span>
          </div>

        </div>

        {/* Info detail tables */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          textAlign: 'left',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <strong>Delivery Address:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{order.address}</p>
          </div>
          
          <div>
            <strong>Contact Info:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Customer: {order.customerName} ({order.phone})</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
            <div>
              <strong>Payment Status:</strong>
              <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Method: {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Paid Online'}</p>
            </div>
            <div>
              <strong>Grand Total:</strong>
              <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Buttons footer */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          <Link href="/" style={{ flex: 1 }}>
            <button className="checkout-btn" style={{ padding: '12px' }}>
              Order Something Else
            </button>
          </Link>
          
          <button 
            onClick={() => {
              const msg = `Hi, I'm checking status of my Order ID ${order.id}. Could you update me?`;
              window.open(`https://wa.me/9779746571404?text=${encodeURIComponent(msg)}`, '_blank');
            }} 
            className="checkout-btn" 
            style={{ background: '#25D366', padding: '12px', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            Chat with Rider
          </button>
        </div>

      </div>

    </div>
  );
}
