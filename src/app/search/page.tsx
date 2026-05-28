'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { defaultRestaurants, defaultCatalog, Restaurant, CatalogItem } from '@/utils/fallbackData';
import { useCart } from '@/context/CartContext';
import { SearchIcon, StarIcon, ClockIcon, MapPinIcon } from '@/components/Icons';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { cart, changeQty, addToCart } = useCart();

  const [query, setQuery] = useState(initialQuery);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync initial query if URL updates
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        // Load Restaurants
        const { data: resData, error: resErr } = await supabase.from('restaurants').select('*');
        if (resErr) throw resErr;
        
        // Load Catalog
        const { data: catData, error: catErr } = await supabase.from('catalog').select('*');
        if (catErr) throw catErr;

        if (resData && resData.length > 0) {
          setRestaurants(resData.map((item: any) => ({
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

        if (catData && catData.length > 0) {
          setCatalog(catData.map((item: any) => ({
            id: item.id,
            restaurant_id: item.restaurant_id,
            name: item.name,
            desc_text: item.desc_text || item.desc || '',
            price: parseFloat(item.price || '0'),
            img: item.img || '/assets/butter_masala.png',
            category: item.category || 'general'
          })));
        } else {
          setCatalog(defaultCatalog);
        }
      } catch (err) {
        console.log('Database read failed in search page. Using fallbacks.');
        setRestaurants(defaultRestaurants);
        setCatalog(defaultCatalog);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cleanQuery = query.toLowerCase().trim();

  // Filter restaurants
  const matchedRestaurants = cleanQuery
    ? restaurants.filter(r => 
        r.name.toLowerCase().includes(cleanQuery) || 
        r.description.toLowerCase().includes(cleanQuery) ||
        r.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Filter dishes
  const matchedDishes = cleanQuery
    ? catalog.filter(item => 
        item.name.toLowerCase().includes(cleanQuery) || 
        item.desc_text.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const hasResults = matchedRestaurants.length > 0 || matchedDishes.length > 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Global Search</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Browse food, cuisines, meals, and grocery outlets in a single search.</p>
      </div>

      {/* Input container */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <input 
          type="text"
          placeholder="What would you like to eat or buy?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 20px 16px 52px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '1rem',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-sm)',
            outline: 'none',
            transition: 'border-color var(--transition-fast)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        <svg 
          style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="admin-pulse" style={{ width: '24px', height: '24px', background: 'var(--primary)', margin: '0 auto 12px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Searching outlet catalogs...</p>
        </div>
      ) : (
        <div>
          {!cleanQuery ? (
            /* Recommended keywords when search query is empty */
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '14px' }}>Popular Searches</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['Burger', 'Pizza', 'Milk', 'Curry', 'Bread', 'Pasta', 'Indian', 'Groceries'].map((keyword) => (
                  <button 
                    key={keyword}
                    onClick={() => setQuery(keyword)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      transition: 'all var(--transition-fast)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'inherit';
                    }}
                  >
                    <SearchIcon size={12} /> {keyword}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {!hasResults ? (
                <div style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <SearchIcon size={48} style={{ color: 'var(--text-muted)' }} />
                  <h4 style={{ fontWeight: 700, marginTop: '16px' }}>No matches found</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>We couldn't find any dishes or stores matching "{query}". Check spelling or try a different term.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Matching Stores */}
                  {matchedRestaurants.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Matching Restaurants & Stores ({matchedRestaurants.length})</h3>
                      <div className="restaurant-grid">
                        {matchedRestaurants.map(restaurant => (
                          <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="restaurant-card">
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
                    </div>
                  )}

                  {/* Matching Dishes */}
                  {matchedDishes.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Dishes & Groceries Found ({matchedDishes.length})</h3>
                      <div className="product-list-row">
                        {matchedDishes.map(item => {
                          const itemQty = cart[item.id] || 0;
                          const resName = restaurants.find(r => r.id === item.restaurant_id)?.name || 'Store';
                          return (
                            <div key={item.id} className="product-card">
                              <div className="product-img-wrapper" style={{ cursor: 'pointer' }} onClick={() => router.push(`/product/${item.id}`)}>
                                <img src={item.img} alt={item.name} className="product-img" />
                              </div>
                              <div className="product-details">
                                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                                  {resName}
                                </div>
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
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '80px 0', alignItems: 'center' }}>
        <div className="admin-pulse" style={{ width: '28px', height: '28px', background: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Preparing search engine...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
