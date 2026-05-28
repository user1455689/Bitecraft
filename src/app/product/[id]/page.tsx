'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { defaultCatalog, defaultRestaurants, Restaurant, CatalogItem } from '@/utils/fallbackData';
import { useCart } from '@/context/CartContext';
import { MapPinIcon, StarIcon, ClockIcon, NoodlesIcon } from '@/components/Icons';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { cart, changeQty, addToCart } = useCart();

  const [product, setProduct] = useState<CatalogItem | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const itemQty = product ? (cart[product.id] || 0) : 0;

  useEffect(() => {
    async function loadProduct() {
      try {
        const supabase = createClient();
        
        // Load Catalog Item
        const { data: itemData, error: itemErr } = await supabase
          .from('catalog')
          .select('*')
          .eq('id', productId)
          .single();

        if (itemErr) throw itemErr;

        let loadedProduct: CatalogItem;
        if (itemData) {
          loadedProduct = {
            id: itemData.id,
            restaurant_id: itemData.restaurant_id,
            name: itemData.name,
            desc_text: itemData.desc_text || itemData.desc || '',
            price: parseFloat(itemData.price),
            img: itemData.img || '/assets/butter_masala.png',
            category: itemData.category || 'general'
          };
        } else {
          // Fallback to static catalog search
          const matched = defaultCatalog.find(i => i.id === productId);
          if (!matched) throw new Error('Product not found in defaults');
          loadedProduct = matched;
        }

        setProduct(loadedProduct);

        // Load Associated Restaurant
        const { data: resData } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', loadedProduct.restaurant_id)
          .single();
        
        if (resData) {
          setRestaurant({
            id: resData.id,
            name: resData.name,
            description: resData.description || '',
            img: resData.img || '/assets/butter_masala.png',
            rating: parseFloat(resData.rating || '4.5'),
            delivery_time: resData.delivery_time || '25 mins',
            distance: resData.distance || '2.0 km',
            category: resData.category || 'burgers',
            featured: resData.featured || false
          });
        } else {
          const matchedRes = defaultRestaurants.find(r => r.id === loadedProduct.restaurant_id);
          setRestaurant(matchedRes || null);
        }

      } catch (err) {
        console.log('Error loading product details, using fallbacks.', err);
        const matched = defaultCatalog.find(i => i.id === productId);
        if (matched) {
          setProduct(matched);
          const matchedRes = defaultRestaurants.find(r => r.id === matched.restaurant_id);
          setRestaurant(matchedRes || null);
        }
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '100px 0' }}>
        <div className="admin-pulse" style={{ width: '32px', height: '32px', background: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving recipe details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <NoodlesIcon size={48} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ fontWeight: 800, marginTop: '20px' }}>Dish not found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>This item may have been removed or is currently unavailable.</p>
        <button 
          onClick={() => router.push('/')}
          style={{
            marginTop: '24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700
          }}
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Back link */}
      <button 
        onClick={() => router.back()} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontWeight: 600,
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      {/* Main product display card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        alignItems: 'stretch'
      }}>
        {/* Left Side: Large image wrapper */}
        <div style={{
          position: 'relative',
          backgroundColor: '#E2E8F0',
          minHeight: '240px',
          height: '240px'
        }}>
          <img 
            src={product.img} 
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Right Side: Details and checkout add buttons */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            {restaurant && (
              <Link href={`/restaurant/${restaurant.id}`} style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '8px'
              }}>
                <MapPinIcon size={12} /> {restaurant.name} {"→"}
              </Link>
            )}

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: '20px'
            }}>
              {product.desc_text}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ${product.price.toFixed(2)}
              </div>
              <span style={{
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                color: '#4CAF50',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                In Stock & Fresh
              </span>
            </div>
            
            {restaurant && (
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ClockIcon size={12} /> Delivery: <strong>{restaurant.delivery_time}</strong></span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><StarIcon size={12} /> Rating: <strong>{restaurant.rating}</strong></span>
              </div>
            )}
          </div>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Select Quantity
              </span>
              {itemQty > 0 ? (
                <div className="qty-controller" style={{ padding: '6px 12px' }}>
                  <button className="qty-btn" style={{ width: '32px', height: '32px' }} onClick={() => changeQty(product.id, -1)}>-</button>
                  <span className="qty-count" style={{ fontSize: '1rem', minWidth: '24px' }}>{itemQty}</span>
                  <button className="qty-btn" style={{ width: '32px', height: '32px' }} onClick={() => changeQty(product.id, 1)}>+</button>
                </div>
              ) : (
                <button 
                  className="checkout-btn" 
                  style={{ width: 'auto', padding: '12px 32px' }} 
                  onClick={() => addToCart(product.id)}
                >
                  Add to Cart
                </button>
              )}
            </div>

            {itemQty > 0 && (
              <Link href="/cart">
                <button className="checkout-btn" style={{ background: 'var(--text-main)', padding: '12px 24px', fontSize: '0.9rem' }}>
                  Go to Cart
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
      

    </div>
  );
}
