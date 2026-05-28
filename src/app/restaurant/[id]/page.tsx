'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { defaultRestaurants, defaultCatalog, Restaurant, CatalogItem } from '@/utils/fallbackData';
import { useCart } from '@/context/CartContext';
import { StarIcon, ClockIcon, MapPinIcon, NoodlesIcon } from '@/components/Icons';

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;
  const { cart, addToCart, changeQty } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<CatalogItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Calculate cart counts
  const totalCartQty = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  useEffect(() => {
    async function loadRestaurantAndMenu() {
      try {
        const supabase = createClient();

        // 1. Fetch Restaurant details
        const { data: resData, error: resErr } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();

        if (resErr) throw resErr;

        let loadedRes: Restaurant;
        if (resData) {
          loadedRes = {
            id: resData.id,
            name: resData.name,
            description: resData.description || '',
            img: resData.img || '/assets/butter_masala.png',
            rating: parseFloat(resData.rating || '4.5'),
            delivery_time: resData.delivery_time || '25 mins',
            distance: resData.distance || '2.0 km',
            category: resData.category || 'burgers',
            featured: resData.featured || false
          };
        } else {
          const matched = defaultRestaurants.find(r => r.id === restaurantId);
          if (!matched) throw new Error('Restaurant not found');
          loadedRes = matched;
        }

        setRestaurant(loadedRes);

        // 2. Fetch Catalog Items
        const { data: itemsData, error: itemsErr } = await supabase
          .from('catalog')
          .select('*')
          .eq('restaurant_id', restaurantId);

        if (itemsErr) throw itemsErr;

        let loadedItems: CatalogItem[] = [];
        if (itemsData && itemsData.length > 0) {
          loadedItems = itemsData.map((item: any) => ({
            id: item.id,
            restaurant_id: item.restaurant_id,
            name: item.name,
            desc_text: item.desc_text || item.desc || '',
            price: parseFloat(item.price),
            img: item.img || '/assets/butter_masala.png',
            category: item.category || 'general'
          }));
        } else {
          // Filter fallback items
          loadedItems = defaultCatalog.filter(i => i.restaurant_id === restaurantId);
        }

        setMenuItems(loadedItems);

      } catch (err) {
        console.log('Error reading restaurant/menu database. Operating in fallback mode.', err);
        const matched = defaultRestaurants.find(r => r.id === restaurantId);
        if (matched) {
          setRestaurant(matched);
          setMenuItems(defaultCatalog.filter(i => i.restaurant_id === restaurantId));
        }
      } finally {
        setLoading(false);
      }
    }

    if (restaurantId) {
      loadRestaurantAndMenu();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '80px 0', alignItems: 'center' }}>
        <div className="admin-pulse" style={{ width: '28px', height: '28px', background: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Opening store menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <NoodlesIcon size={48} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ fontWeight: 800, marginTop: '20px' }}>Store not found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We could not locate this restaurant or grocery outlet.</p>
        <button 
          onClick={() => router.push('/')}
          style={{
            marginTop: '24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '10px 24px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Get unique categories for tabs
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = activeTab === 'All'
    ? menuItems
    : menuItems.filter(item => item.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div>
      {/* Restaurant Header */}
      <div className="restaurant-details-header">
        <div className="restaurant-hero">
          <img src={restaurant.img} alt={restaurant.name} className="restaurant-hero-img" />
          <div className="restaurant-hero-overlay"></div>
          <div className="restaurant-hero-content">
            <h1 className="restaurant-hero-title">{restaurant.name}</h1>
            <p className="restaurant-hero-tags">🏪 Category: {restaurant.category.toUpperCase()}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="restaurant-quick-stats">
          <div className="quick-stat-item">
            <span className="quick-stat-label">Rating</span>
            <span className="quick-stat-value" style={{ color: '#4CAF50', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><StarIcon size={12} /> {restaurant.rating.toFixed(1)}</span>
          </div>
          <div className="quick-stat-item" style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '0 24px' }}>
            <span className="quick-stat-label">Delivery Time</span>
            <span className="quick-stat-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ClockIcon size={12} /> {restaurant.delivery_time}</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Distance</span>
            <span className="quick-stat-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPinIcon size={12} /> {restaurant.distance}</span>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
          {restaurant.description}
        </p>
      </div>

      {/* Menu Categories Tab List */}
      <div className="menu-tabs-wrapper">
        <div className="menu-tabs-container">
          {categories.map(cat => (
            <button
              key={cat}
              className={`menu-tab ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Menu list */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
          {activeTab === 'All' ? 'Full Menu' : activeTab} ({filteredItems.length} items)
        </h3>

        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <NoodlesIcon size={40} style={{ color: 'var(--text-muted)' }} />
            <h4 style={{ fontWeight: 700, marginTop: '12px' }}>No items in this section</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>We don't have dishes loaded in this menu segment currently.</p>
          </div>
        ) : (
          <div className="product-list-row">
            {filteredItems.map(item => {
              const itemQty = cart[item.id] || 0;
              return (
                <div key={item.id} className="product-card">
                  <div className="product-img-wrapper" style={{ cursor: 'pointer' }} onClick={() => router.push(`/product/${item.id}`)}>
                    <img src={item.img} alt={item.name} className="product-img" />
                  </div>
                  <div className="product-details">
                    <Link href={`/product/${item.id}`} className="product-title" style={{ fontWeight: 700 }}>
                      {item.name}
                    </Link>
                    <p className="product-desc">{item.desc_text}</p>
                    <div className="product-price-row">
                      <span className="product-price">${item.price.toFixed(2)}</span>
                      
                      {itemQty > 0 ? (
                        <div className="qty-controller">
                          <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>-</button>
                          <span className="qty-count">{itemQty}</span>
                          <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                        </div>
                      ) : (
                        <button className="add-cart-btn" onClick={() => addToCart(item.id)}>Add to Cart</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Sticky cart footer bar for mobile viewports */}
      {totalCartQty > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '16px',
          right: '16px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100
        }}>
          <div>
            <span style={{ fontWeight: 700 }}>{totalCartQty} Items added</span>
            <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>Checkout your items</p>
          </div>
          <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            View Cart
          </Link>
        </div>
      )}
    </div>
  );
}
