'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import MapSelector from '@/components/MapSelector';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { address, user, updateAddress } = useUser();
  const [searchVal, setSearchVal] = useState('');
  const [theme, setTheme] = useState('light');
  const [showMap, setShowMap] = useState(false);

  // Calculate total items count in cart
  const cartItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  useEffect(() => {
    // Sync theme
    const savedTheme = localStorage.getItem('bitecraft_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('bitecraft_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleMapConfirm = (fullAddress: string, lat: number, lng: number) => {
    updateAddress(`${fullAddress} [GPS: ${lat},${lng}]`);
    setShowMap(false);
  };

  // Strip coordinates from display in navbar
  const displayAddress = address.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, '');

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          
          {/* Left Section - Logo & Address */}
          <div className="navbar-left">
            <Link href="/" className="logo-section">
              <div className="logo-circle">B</div>
              <div className="logo-text">Bite<span>Craft</span></div>
            </Link>

            <div className="address-selector" onClick={() => setShowMap(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="address-text" title={address}>
                {displayAddress || 'Pin Location on Map'}
              </span>
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div className="navbar-center">
            <form onSubmit={handleSearchSubmit} className="search-bar-container">
              <input
                type="text"
                placeholder="Search food, restaurants, groceries..."
                className="search-bar-input"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => {
                  if (pathname !== '/search') {
                    router.push('/search');
                  }
                }}
              />
              <svg className="search-bar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </form>
          </div>

          {/* Right Section - Navigation Links */}
          <div className="navbar-right">
            <Link href="/offers" className={`nav-link ${pathname === '/offers' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="8" x2="17" y2="8" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="7" y1="16" x2="13" y2="16" />
              </svg>
              Offers
            </Link>

            <Link href="/wishlist" className={`nav-link ${pathname === '/wishlist' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Wishlist
            </Link>

            <Link href="/cart" className={`nav-link ${pathname === '/cart' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Cart
              {cartItemsCount > 0 && (
                <span className="cart-nav-badge">{cartItemsCount}</span>
              )}
            </Link>

            <Link href="/profile" className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {user.isLoggedIn ? user.name.split(' ')[0] : 'Sign In'}
            </Link>

            <button onClick={toggleTheme} className="nav-link theme-toggle-btn" title="Toggle Theme" aria-label="Toggle Theme">
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.72" x2="5.64" y2="18.3" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            <Link href="/admin" className="nav-link admin-nav-btn">
              Admin
            </Link>
          </div>

        </div>
      </nav>

      {/* Map selector modal */}
      {showMap && (
        <MapSelector 
          onClose={() => setShowMap(false)} 
          onConfirm={handleMapConfirm}
        />
      )}
    </>
  );
}
