'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { defaultRestaurants, Restaurant } from '@/utils/fallbackData';
import { HeartIcon, StarIcon, ClockIcon, MapPinIcon } from '@/components/Icons';

export default function WishlistPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [favorites, setFavorites] = useState<{ [id: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Load favorites dictionary
    const favoritesStr = localStorage.getItem('bitecraft_favorites') || '{}';
    try {
      setFavorites(JSON.parse(favoritesStr));
    } catch (e) {}

    // 2. Load restaurants
    async function loadRestaurants() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('restaurants').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setRestaurants(data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            img: item.img || '/assets/butter_masala.png',
            rating: parseFloat(item.rating || '4.5'),
            delivery_time: item.delivery_time || '25 mins',
            distance: item.distance || '2.0 km',
            category: item.category || 'burgers',
            featured: item.featured || false
          })));
        } else {
          setRestaurants(defaultRestaurants);
        }
      } catch (err) {
        setRestaurants(defaultRestaurants);
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  const favoriteRestaurants = restaurants.filter(r => !!favorites[r.id]);

  const handleRemoveFavorite = (e: React.MouseEvent, resId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = { ...favorites };
    delete updated[resId];
    localStorage.setItem('bitecraft_favorites', JSON.stringify(updated));
    setFavorites(updated);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '100px 0', alignItems: 'center' }}>
        <div className="admin-pulse" style={{ width: '28px', height: '28px', background: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your favorites...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>My Wishlist</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Saved outlets, food stores, and grocery options.</p>
      </div>

      {favoriteRestaurants.length === 0 ? (
        <div className="wishlist-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <HeartIcon size={64} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontWeight: 800, marginTop: '20px' }}>Your Wishlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px', lineHeight: 1.5 }}>
            Tap the heart icon on any restaurant or grocery card to save them here for quick access later!
          </p>
          <Link href="/">
            <button className="checkout-btn" style={{ marginTop: '24px', width: 'auto', padding: '12px 32px' }}>
              Explore Food & Groceries
            </button>
          </Link>
        </div>
      ) : (
        <div className="restaurant-grid">
          {favoriteRestaurants.map(restaurant => (
            <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="restaurant-card">
              <button 
                className="favorite-btn active"
                onClick={(e) => handleRemoveFavorite(e, restaurant.id)}
                aria-label="Remove from Wishlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              <div className="restaurant-img-container">
                <img src={restaurant.img} alt={restaurant.name} className="restaurant-img" />
              </div>
                <div className="restaurant-info">
                  <h4 className="restaurant-name">{restaurant.name}</h4>
                  <p className="restaurant-desc">{restaurant.description}</p>
                  <div className="restaurant-meta">
                    <div className="meta-item rating-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><StarIcon size={12} /> {restaurant.rating.toFixed(1)}</div>
                    <div className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ClockIcon size={12} /> {restaurant.delivery_time}</div>
                    <div className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPinIcon size={12} /> {restaurant.distance}</div>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
