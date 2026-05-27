'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { defaultRestaurants, defaultCategories, defaultCatalog, Restaurant, CatalogItem } from '@/utils/fallbackData';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const { cart, addToCart, changeQty } = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch restaurants and catalog items from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        // 1. Fetch Restaurants
        const { data: resData, error: resErr } = await supabase
          .from('restaurants')
          .select('*');
        
        if (resErr) throw resErr;
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

        // 2. Fetch Catalog Items
        const { data: catData, error: catErr } = await supabase
          .from('catalog')
          .select('*');
        
        if (catErr) throw catErr;
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
        console.log('Supabase fetch failed. Operating in fallback local mode.', err);
        setRestaurants(defaultRestaurants);
        setCatalog(defaultCatalog);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null); // Clear filter
    } else {
      setSelectedCategory(catId);
    }
  };

  const filteredRestaurants = selectedCategory
    ? restaurants.filter(r => r.category.toLowerCase() === selectedCategory.toLowerCase())
    : restaurants;

  const filteredCatalog = selectedCategory
    ? catalog.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase())
    : catalog;

  const featuredRestaurants = filteredRestaurants.filter(r => r.featured);
  const otherRestaurants = filteredRestaurants.filter(r => !r.featured);

  return (
    <div>
      {/* Welcome Row */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Hello, {user.isLoggedIn ? user.name : 'Foodie'}! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            What are we ordering today?
          </p>
        </div>
      </div>

      {/* Promos Banner */}
      <div className="home-banner">
        <div className="banner-content">
          <span className="banner-tag">Limited Offer</span>
          <h3 className="banner-title">Craving Delicious Food? Get 50% Off!</h3>
          <p className="banner-desc">Use code <strong style={{ color: 'var(--accent)' }}>SAVE50</strong> on checkout for half price deliveries.</p>
          <Link href="/offers">
            <button className="banner-btn">View All Offers</button>
          </Link>
        </div>
        <div className="banner-img-container">
          <img 
            src="/assets/food_banner.png" 
            alt="Delicious Banner Food" 
            className="banner-img"
          />
        </div>
      </div>

      {/* Category Scroll Component */}
      <div className="section-title-row">
        <h3 className="section-title">Browse by Category</h3>
        <Link href="/categories" className="view-all-link">View All Categories</Link>
      </div>

      <div className="categories-scroll">
        {defaultCategories.map((cat) => (
          <div 
            key={cat.id} 
            className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            <div className="category-icon-wrapper">
              <img src={cat.img} alt={cat.name} className="category-img" />
            </div>
            <span className="category-name">{cat.name}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px 0', alignItems: 'center' }}>
          <div className="admin-pulse" style={{ width: '24px', height: '24px', background: 'var(--primary)' }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Finding best stores near you...</p>
        </div>
      ) : (
        <>
          {/* Featured Stores */}
          {featuredRestaurants.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div className="section-title-row">
                <h3 className="section-title">Featured Stores & Restaurants</h3>
              </div>
              <div className="restaurant-grid">
                {featuredRestaurants.map((res) => (
                  <RestaurantCard key={res.id} restaurant={res} />
                ))}
              </div>
            </div>
          )}

          {/* All Restaurants / Stores */}
          <div style={{ marginBottom: '36px' }}>
            <div className="section-title-row">
              <h3 className="section-title">
                {selectedCategory ? `${defaultCategories.find(c => c.id === selectedCategory)?.name || ''} Outlets` : 'All Restaurants & Grocery Stores'}
              </h3>
            </div>
            {filteredRestaurants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '2.5rem' }}>🍽️</span>
                <h4 style={{ fontWeight: 700, marginTop: '12px' }}>No outlets found</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Try switching category filter to view other restaurants.</p>
              </div>
            ) : (
              <div className="restaurant-grid">
                {selectedCategory ? filteredRestaurants.map((res) => (
                  <RestaurantCard key={res.id} restaurant={res} />
                )) : otherRestaurants.map((res) => (
                  <RestaurantCard key={res.id} restaurant={res} />
                ))}
              </div>
            )}
          </div>

          {/* Dishes and products catalogue listing on homepage */}
          <div>
            <div className="section-title-row">
              <h3 className="section-title">
                {selectedCategory ? `Popular ${defaultCategories.find(c => c.id === selectedCategory)?.name || ''} Items` : 'Popular Dishes & Daily Essentials'}
              </h3>
            </div>
            {filteredCatalog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '2.5rem' }}>🍲</span>
                <h4 style={{ fontWeight: 700, marginTop: '12px' }}>No items found</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Try changing the category to see other products.</p>
              </div>
            ) : (
              <div className="product-list-row">
                {filteredCatalog.map(item => {
                  const itemQty = cart[item.id] || 0;
                  const associatedStoreName = restaurants.find(r => r.id === item.restaurant_id)?.name || 'Store';
                  return (
                    <div key={item.id} className="product-card">
                      <div 
                        className="product-img-wrapper" 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => router.push(`/product/${item.id}`)}
                      >
                        <img src={item.img} alt={item.name} className="product-img" />
                      </div>
                      <div className="product-details">
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                          {associatedStoreName}
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
            )}
          </div>
        </>
      )}
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favoritesStr = localStorage.getItem('bitecraft_favorites') || '{}';
    try {
      const favs = JSON.parse(favoritesStr);
      setIsFavorite(!!favs[restaurant.id]);
    } catch (e) {}
  }, [restaurant.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favoritesStr = localStorage.getItem('bitecraft_favorites') || '{}';
    try {
      const favs = JSON.parse(favoritesStr);
      favs[restaurant.id] = !isFavorite;
      localStorage.setItem('bitecraft_favorites', JSON.stringify(favs));
      setIsFavorite(!isFavorite);
    } catch (err) {}
  };

  return (
    <Link href={`/restaurant/${restaurant.id}`} className="restaurant-card">
      <button 
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
        onClick={toggleFavorite}
        aria-label="Add to Wishlist"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {restaurant.featured && (
        <span className="featured-badge">Featured</span>
      )}

      <div className="restaurant-img-container">
        <img 
          src={restaurant.img} 
          alt={restaurant.name} 
          className="restaurant-img"
        />
      </div>

      <div className="restaurant-info">
        <h4 className="restaurant-name">{restaurant.name}</h4>
        <p className="restaurant-desc">{restaurant.description}</p>
        
        <div className="restaurant-meta">
          <div className="meta-item rating-badge">
            ⭐ {restaurant.rating.toFixed(1)}
          </div>
          <div className="meta-item">
            ⏱️ {restaurant.delivery_time}
          </div>
          <div className="meta-item">
            📍 {restaurant.distance}
          </div>
        </div>
      </div>
    </Link>
  );
}
