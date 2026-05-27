'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { defaultRestaurants, defaultCategories, Restaurant } from '@/utils/fallbackData';

function CategoriesContent() {
  const searchParams = useSearchParams();
  const catQuery = searchParams.get('c');
  const [selectedCat, setSelectedCat] = useState<string | null>(catQuery);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync selected category if query changes
  useEffect(() => {
    if (catQuery) {
      setSelectedCat(catQuery);
    }
  }, [catQuery]);

  useEffect(() => {
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

  const filteredRestaurants = selectedCat
    ? restaurants.filter(r => r.category.toLowerCase() === selectedCat.toLowerCase())
    : restaurants;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Food Categories</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a category to filter stores and delivery options near you.</p>
      </div>

      {/* Grid of categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div 
          onClick={() => setSelectedCat(null)}
          style={{
            cursor: 'pointer',
            backgroundColor: !selectedCat ? 'var(--primary-light)' : 'var(--bg-surface)',
            border: `1px solid ${!selectedCat ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ width: '60px', height: '60px', overflow: 'hidden', borderRadius: '50%', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', fontSize: '1.6rem' }}>
            🍽️
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: !selectedCat ? 'var(--primary)' : 'var(--text-main)' }}>All Outlets</span>
        </div>

        {defaultCategories.map(cat => {
          const isActive = selectedCat?.toLowerCase() === cat.id.toLowerCase();
          return (
            <div 
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              style={{
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-surface)',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ width: '60px', height: '60px', overflow: 'hidden', borderRadius: '50%', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--text-main)' }}>{cat.name}</span>
            </div>
          );
        })}
      </div>

      {/* Results Title */}
      <div className="section-title-row">
        <h3 className="section-title">
          {!selectedCat 
            ? 'All Available Food Outlets' 
            : `${defaultCategories.find(c => c.id === selectedCat)?.name || ''} Outlets (${filteredRestaurants.length})`
          }
        </h3>
      </div>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' } as any}>
          <div className="admin-pulse" style={{ width: '20px', height: '20px', background: 'var(--primary)', margin: '0 auto 10px' }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sorting restaurants...</p>
        </div>
      ) : (
        <>
          {filteredRestaurants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '2.5rem' }}>🍃</span>
              <h4 style={{ fontWeight: 700, marginTop: '12px' }}>No outlets found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>There are no outlets matching this category filter currently.</p>
            </div>
          ) : (
            <div className="restaurant-grid">
              {filteredRestaurants.map(restaurant => (
                <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="restaurant-card">
                  <div className="restaurant-img-container">
                    <img src={restaurant.img} alt={restaurant.name} className="restaurant-img" />
                  </div>
                  <div className="restaurant-info">
                    <h4 className="restaurant-name">{restaurant.name}</h4>
                    <p className="restaurant-desc">{restaurant.description}</p>
                    <div className="restaurant-meta">
                      <div className="meta-item rating-badge">⭐ {restaurant.rating.toFixed(1)}</div>
                      <div className="meta-item">⏱️ {restaurant.delivery_time}</div>
                      <div className="meta-item">📍 {restaurant.distance}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '80px 0', alignItems: 'center' }}>
        <div className="admin-pulse" style={{ width: '28px', height: '28px', background: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Opening categories catalog...</p>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
