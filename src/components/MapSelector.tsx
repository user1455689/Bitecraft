'use client';

import React, { useState, useEffect, useRef } from 'react';

interface MapSelectorProps {
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  readOnly?: boolean; // If true, just displays the location on map
}

export default function MapSelector({ onClose, onConfirm, initialLat, initialLng, readOnly = false }: MapSelectorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [addressText, setAddressText] = useState('Locating...');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || 27.7172, // Default to Kathmandu, Nepal (from user phone code +977)
    lng: initialLng || 85.3240
  });
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const leafletLoadedRef = useRef(false);

  // Load Leaflet assets dynamically to prevent SSR document/window undefined issues
  useEffect(() => {
    let active = true;

    const initMap = async () => {
      const L = await loadLeafletAssets();
      if (!active || !mapContainerRef.current) return;

      // Create Map
      const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 15);
      mapInstanceRef.current = map;

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create Marker
      const markerOptions = {
        draggable: !readOnly
      };
      const marker = L.marker([coords.lat, coords.lng], markerOptions).addTo(map);
      markerInstanceRef.current = marker;

      // Geocode initial position
      geocodeLatLng(coords.lat, coords.lng);

      if (!readOnly) {
        // Dragend event
        marker.on('dragend', async () => {
          const newPos = marker.getLatLng();
          setCoords({ lat: newPos.lat, lng: newPos.lng });
          geocodeLatLng(newPos.lat, newPos.lng);
        });

        // Click map event
        map.on('click', (e: any) => {
          const clickPos = e.latlng;
          marker.setLatLng(clickPos);
          setCoords({ lat: clickPos.lat, lng: clickPos.lng });
          geocodeLatLng(clickPos.lat, clickPos.lng);
        });
      }
    };

    initMap();

    return () => {
      active = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Geocode Nominatim reverse
  const geocodeLatLng = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await res.json();
      setAddressText(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch (e) {
      setAddressText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoadingAddress(false);
    }
  };

  // Get User Current GPS Location
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);
        setLocatingGPS(false);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          markerInstanceRef.current.setLatLng([latitude, longitude]);
        }
        geocodeLatLng(latitude, longitude);
      },
      (error) => {
        console.error('Error fetching GPS coords', error);
        alert('Could not retrieve your location. Please check browser permissions.');
        setLocatingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirmClick = () => {
    onConfirm(addressText, coords.lat, coords.lng);
  };

  // Helper loader
  const loadLeafletAssets = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).L) {
        resolve((window as any).L);
        return;
      }

      // Add CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Add JS Script
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        resolve((window as any).L);
      };
      document.body.appendChild(script);
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '580px', width: '100%' }}>
        <div className="modal-header">
          <span className="modal-title">
            {readOnly ? 'Order Delivery Location' : 'Select Delivery Location on Map'}
          </span>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body" style={{ padding: '16px' }}>
          
          {/* Map canvas container */}
          <div 
            ref={mapContainerRef} 
            style={{ 
              width: '100%', 
              height: '320px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: '#E2E8F0',
              marginBottom: '16px',
              zIndex: 1
            }}
          />

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* GPS action */}
            {!readOnly && (
              <button 
                type="button"
                onClick={handleLocateUser}
                disabled={locatingGPS}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                  border: '1px dashed var(--primary)'
                }}
              >
                📡 {locatingGPS ? 'Pinpointing GPS Coordinates...' : 'Use My Current Live Geolocation'}
              </button>
            )}

            {/* Address output text box */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '0.85rem'
            }}>
              <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {loadingAddress ? 'Reverse-geocoding...' : 'Pinpointed Address Location:'}
              </strong>
              <span style={{ fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
                {addressText}
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px' }}>
                GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </span>
            </div>

            {/* Confirmation actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button 
                type="button" 
                onClick={onClose}
                className="profile-logout-btn"
                style={{ flex: 1, margin: 0 }}
              >
                Close Map
              </button>
              
              {!readOnly && (
                <button 
                  type="button"
                  onClick={handleConfirmClick}
                  disabled={loadingAddress}
                  className="checkout-btn"
                  style={{ flex: 2, padding: '10px' }}
                >
                  Confirm This Location
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
