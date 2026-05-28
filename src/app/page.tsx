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
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Auto-slide carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Calculate cart count and subtotal
  useEffect(() => {
    let priceTotal = 0;
    let countTotal = 0;
    Object.keys(cart).forEach(id => {
      const item = catalog.find(p => p.id === id);
      if (item) {
        priceTotal += item.price * cart[id];
        countTotal += cart[id];
      }
    });
    setSubtotal(priceTotal);
    setCartCount(countTotal);
  }, [cart, catalog]);

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
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Hello, {user.isLoggedIn ? user.name : 'Foodie'}! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            What are we ordering today?
          </p>
        </div>
        <div className="header-delivery-badge">
          <span>⚡</span>
          <span>12 MINS DELIVERY</span>
        </div>
      </div>

      {/* Promos Banner Slideshow */}
      <div className="playful-carousel-container">
        {/* Slide 0: Summer Mode ON */}
        <div 
          className="playful-carousel-slide slide-summer"
          style={{ 
            display: activeSlide === 0 ? 'flex' : 'none',
          }}
        >
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="banner-tag" style={{ backgroundColor: '#2E7D32', color: 'white' }}>LIVE SEASONAL</span>
            <h3 className="playful-banner-title">Summer Mode ON ☀️</h3>
            <p className="playful-banner-subtitle">Get refreshing beverages, cool ice creams & fresh summer fruits!</p>
            <div style={{ fontSize: '0.85rem', color: '#1B4332' }}>
              ⚡ Delivered cold in <strong>10 mins</strong>
            </div>
          </div>
          <div className="banner-grid-items">
            <div className="banner-mini-card">
              <span className="mini-card-icon">🍹</span>
              <span className="mini-card-label">Beverages</span>
            </div>
            <div className="banner-mini-card">
              <span className="mini-card-icon">🍦</span>
              <span className="mini-card-label">Ice Creams</span>
            </div>
            <div className="banner-mini-card">
              <span className="mini-card-icon">🥥</span>
              <span className="mini-card-label">Fruits</span>
            </div>
            <div className="banner-mini-card">
              <span className="mini-card-icon">🏠</span>
              <span className="mini-card-label">Home Essentials</span>
            </div>
          </div>
        </div>

        {/* Slide 1: Mango Bliss */}
        <div 
          className="playful-carousel-slide slide-mango"
          style={{ 
            display: activeSlide === 1 ? 'flex' : 'none',
          }}
        >
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="banner-tag" style={{ backgroundColor: '#D50000', color: 'white' }}>FRESH ARRIVAL</span>
            <h3 className="playful-banner-title">Pure Mango Bliss 🥭</h3>
            <p className="playful-banner-subtitle">Direct from orchards: Sweet Alphonso, Kesar, and ripe organic mangoes!</p>
            <div style={{ fontSize: '0.85rem', color: '#5D2A00' }}>
              ⭐ Certified sweet & juice-ready!
            </div>
          </div>
          <div className="banner-grid-items">
            <div className="banner-mini-card">
              <span className="mini-card-icon">🥭</span>
              <span className="mini-card-label">Fresh Mangoes</span>
            </div>
            <div className="banner-mini-card">
              <span className="mini-card-icon">🍧</span>
              <span className="mini-card-label">Gelato</span>
            </div>
            <div className="banner-mini-card">
              <span className="mini-card-icon">🥤</span>
              <span className="mini-card-label">Mango Shakes</span>
            </div>
            <div className="banner-mini-card">
              <span className="mini-card-icon">🍨</span>
              <span className="mini-card-label">Custards</span>
            </div>
          </div>
        </div>

        {/* Slide 2: Original 50% discount */}
        <div 
          className="playful-carousel-slide"
          style={{ 
            display: activeSlide === 2 ? 'flex' : 'none',
            background: 'linear-gradient(135deg, #1C2331, #0B0E14)',
            color: 'white'
          }}
        >
          <div className="banner-content" style={{ maxWidth: '60%' }}>
            <span className="banner-tag">Limited Offer</span>
            <h3 className="banner-title" style={{ fontSize: '2rem', fontWeight: 800 }}>Craving Food? Get 50% Off!</h3>
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

        {/* Dots indicators */}
        <div className="carousel-dots">
          {[0, 1, 2].map(idx => (
            <button 
              key={idx}
              className={`carousel-dot ${activeSlide === idx ? 'active' : ''}`}
              onClick={() => setActiveSlide(idx)}
            />
          ))}
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
          {/* Price Drop Zone */}
          <div style={{ marginBottom: '36px' }}>
            <div className="price-drop-header">
              <span className="price-drop-icon" style={{ fontSize: '1.6rem' }}>🔔</span>
              <h3 className="section-title" style={{ margin: 0 }}>Price Drop Zone</h3>
            </div>
            <div className="product-list-row">
              {catalog.filter(i => ['fresh-milk', 'sliced-bread', 'ib-french-fries', 'ib-burger-veg'].includes(i.id)).map(item => {
                const itemQty = cart[item.id] || 0;
                const originalPrice = item.price * 1.4; // Simulate a 40% higher original price
                const associatedStoreName = restaurants.find(r => r.id === item.restaurant_id)?.name || 'Store';
                return (
                  <div key={`pd-${item.id}`} className="product-card" style={{ position: 'relative' }}>
                    <span className="price-drop-badge">40% OFF</span>
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
                      <div className="product-price-row" style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            ${originalPrice.toFixed(2)}
                          </span>
                          <span className="product-price" style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        
                        {itemQty > 0 ? (
                          <div className="qty-controller">
                            <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>-</button>
                            <span className="qty-count">{itemQty}</span>
                            <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                          </div>
                        ) : (
                          <button className="add-cart-btn" onClick={() => addToCart(item.id)} style={{ width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.4rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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

      {/* Floating Scooter Progress Bar */}
      {subtotal > 0 && (
        <div className="scooter-progress-container">
          <span style={{ fontSize: '1.2rem' }}>{subtotal >= 15 ? '🎉' : '🛵'}</span>
          <div className="scooter-progress-bar-bg">
            <div 
              className="scooter-progress-bar-fill"
              style={{ width: `${Math.min(100, (subtotal / 15) * 100)}%` }}
            />
            <span 
              className="scooter-icon-marker"
              style={{ left: `${Math.min(100, (subtotal / 15) * 100)}%` }}
            >
              {subtotal >= 15 ? '🛵💨' : '🛵'}
            </span>
          </div>
          <span className="scooter-progress-text">
            {subtotal >= 15 
              ? 'FREE Delivery Unlocked!' 
              : `Add $${(15.00 - subtotal).toFixed(2)} more for FREE Delivery!`
            }
          </span>
        </div>
      )}

      {/* Floating Cart Pill */}
      {cartCount > 0 && (
        <Link href="/cart">
          <div className="floating-cart-pill">
            <span className="floating-cart-icon">🛒</span>
            <span>{cartCount} {cartCount === 1 ? 'item' : 'items'} • ${subtotal.toFixed(2)}</span>
            <span className="floating-cart-arrow">→</span>
          </div>
        </Link>
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
