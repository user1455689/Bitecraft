'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { defaultRestaurants, defaultCatalog, Restaurant, CatalogItem, getSupabaseFallbackString } from '@/utils/fallbackData';
import { MapPinIcon, PlusIcon, SparklesIcon } from '@/components/Icons';
import MapSelector from '@/components/MapSelector';

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

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [dbMode, setDbMode] = useState<'live' | 'local'>('local');

  // Food Item Modal Form State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImg, setFormImg] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formRestaurantId, setFormRestaurantId] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showSqlDoc, setShowSqlDoc] = useState(false);

  // Map view coordinates in admin panel
  const [activeMapCoords, setActiveMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
    fetchCatalogAndStores();
    setupSubscriptions();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // 1. Fetch Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setDbMode('live');
        const loadedOrders: Order[] = [];
        for (const orderRow of data) {
          const { data: itemRows } = await supabase
            .from('order_items')
            .select('qty, price, catalog(name)')
            .eq('order_id', orderRow.id);

          const items: OrderItem[] = (itemRows || []).map((ir: any) => ({
            id: ir.item_id || "",
            name: ir.catalog?.name || "Dish Item",
            qty: ir.qty,
            price: parseFloat(ir.price)
          }));

          loadedOrders.push({
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
        }
        setOrders(loadedOrders);
      } else {
        loadLocalOrders();
      }
    } catch (err) {
      console.log('Orders fetch failed. Using local storage fallback.');
      loadLocalOrders();
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadLocalOrders = () => {
    const historyStr = localStorage.getItem('bitecraft_orders_history') || '[]';
    try {
      setOrders(JSON.parse(historyStr));
    } catch (e) {}
  };

  // 2. Fetch Catalog and Restaurants
  const fetchCatalogAndStores = async () => {
    setLoadingCatalog(true);
    try {
      // Fetch Restaurants
      const { data: resData, error: resErr } = await supabase.from('restaurants').select('*');
      if (resErr) throw resErr;
      
      // Fetch Catalog
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
          price: parseFloat(item.price),
          img: item.img || '/assets/butter_masala.png',
          category: item.category || 'general'
        })));
      } else {
        setCatalog(defaultCatalog);
      }
    } catch (err) {
      console.log('Catalog database fetch failed. Using fallback catalog.');
      setRestaurants(defaultRestaurants);
      setCatalog(defaultCatalog);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // 3. Realtime subscriptions
  const setupSubscriptions = () => {
    try {
      supabase
        .channel('schema-admin-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchOrders();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'catalog' }, () => {
          fetchCatalogAndStores();
        })
        .subscribe();
    } catch (e) {}
  };

  // Status updates
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    // 1. Try DB write
    if (dbMode === 'live') {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);
        
        if (error) throw error;
        showToast(`Order status updated to: ${newStatus}`);
        fetchOrders();
        return;
      } catch (err) {
        console.warn('Failed to update status in Supabase. Updating locally.');
      }
    }

    // 2. Local update fallback
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem('bitecraft_orders_history', JSON.stringify(updated));
    showToast(`Local order status updated to: ${newStatus}`);
  };

  // CRUD Catalog Handlers
  const handleOpenFoodModal = (item: CatalogItem | null) => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormDesc(item.desc_text);
      setFormPrice(item.price.toString());
      setFormImg(item.img);
      setFormCategory(item.category);
      setFormRestaurantId(item.restaurant_id);
    } else {
      setEditingItem(null);
      setFormName('');
      setFormDesc('');
      setFormPrice('');
      setFormImg('/assets/butter_masala.png');
      setFormCategory('burgers');
      setFormRestaurantId(restaurants[0]?.id || 'el-corral');
    }
    setShowFoodModal(true);
  };

  const handleSaveFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice);

    if (formName.trim() === '' || isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid item name and price.');
      return;
    }

    const itemObject = {
      name: formName.trim(),
      desc_text: formDesc.trim(),
      price: priceNum,
      img: formImg.trim(),
      category: formCategory.toLowerCase().trim(),
      restaurant_id: formRestaurantId
    };

    if (dbMode === 'live') {
      try {
        if (editingItem) {
          // Update
          const { error } = await supabase
            .from('catalog')
            .update({
              name: itemObject.name,
              desc_text: itemObject.desc_text,
              price: itemObject.price,
              img: itemObject.img,
              category: itemObject.category,
              restaurant_id: itemObject.restaurant_id
            })
            .eq('id', editingItem.id);

          if (error) throw error;
          showToast(`Item "${itemObject.name}" updated in database!`);
        } else {
          // Insert
          const newItemId = 'dish-' + Math.floor(1000 + Math.random() * 9000);
          const { error } = await supabase
            .from('catalog')
            .insert({
              id: newItemId,
              name: itemObject.name,
              desc_text: itemObject.desc_text,
              price: itemObject.price,
              img: itemObject.img,
              category: itemObject.category,
              restaurant_id: itemObject.restaurant_id
            });

          if (error) throw error;
          showToast(`Item "${itemObject.name}" added to database!`);
        }
        fetchCatalogAndStores();
        setShowFoodModal(false);
        return;
      } catch (err) {
        console.warn('Failed CRUD action on Supabase. Using fallback catalog.', err);
      }
    }

    // Local catalog update fallback
    if (editingItem) {
      const updatedCat = catalog.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            ...itemObject
          };
        }
        return item;
      });
      setCatalog(updatedCat);
      showToast(`Local item "${itemObject.name}" updated!`);
    } else {
      const newItemId = 'dish-' + Math.floor(1000 + Math.random() * 9000);
      const newCatItem = {
        id: newItemId,
        ...itemObject
      };
      setCatalog([...catalog, newCatItem]);
      showToast(`Local item "${itemObject.name}" added!`);
    }

    setShowFoodModal(false);
  };

  const handleDeleteFoodItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this catalog item?')) return;

    if (dbMode === 'live') {
      try {
        const { error } = await supabase.from('catalog').delete().eq('id', itemId);
        if (error) throw error;
        showToast('Item deleted from database.');
        fetchCatalogAndStores();
        return;
      } catch (e) {
        console.warn('Failed deletion on Supabase. Deleting locally.');
      }
    }

    setCatalog(catalog.filter(i => i.id !== itemId));
    showToast('Local item deleted.');
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(getSupabaseFallbackString());
    showToast('SQL DDL copied to clipboard!');
  };

  return (
    <>
      <div>
        {/* Title */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Admin Dashboard Panel</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track orders, modify delivery states, and configure food catalog inventories.</p>
          </div>
          
          {/* DB Sync indicator */}
          <div style={{
            backgroundColor: dbMode === 'live' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 200, 55, 0.1)',
            color: dbMode === 'live' ? '#2E7D32' : '#B78A00',
            border: `1px solid ${dbMode === 'live' ? '#4CAF50' : '#FFC837'}`,
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className="admin-pulse" style={{ background: dbMode === 'live' ? '#4CAF50' : '#FFC837' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              {dbMode === 'live' ? 'SUPABASE ACTIVE SYNC' : 'LOCAL STORAGE BACKUP'}
            </span>
          </div>
        </div>

        {/* SQL Script guide */}
        <div style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => setShowSqlDoc(!showSqlDoc)}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
          >
            {showSqlDoc ? 'Hide SQL Database Setup Script' : 'Show SQL Database Setup Script'}
          </button>

          {showSqlDoc && (
            <div className="alert-box" style={{ marginTop: '12px' }}>
              <div className="alert-title">Initialize Supabase Schema Tables</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Run this schema setup script in your Supabase SQL Editor to initialize all necessary tables and seed initial outlets.
              </p>
              <textarea
                readOnly
                value={getSupabaseFallbackString()}
                className="sql-code-box"
                style={{ width: '100%', height: '220px', border: '1px solid var(--border-color)', resize: 'vertical', fontSize: '0.7rem' }}
              />
              <button onClick={copySqlToClipboard} className="sql-copy-btn" style={{ cursor: 'pointer' }}>
                Copy Schema SQL
              </button>
            </div>
          )}
        </div>

        {/* Layout grids */}
        <div className="admin-grid">
          
          {/* Left Side: Order list tracker */}
          <div className="admin-table-box">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Live Placed Orders ({orders.length})
            </h3>

            {loadingOrders ? (
              <div style={{ padding: '30px 0', textAlign: 'center' }}>
                <div className="admin-pulse" style={{ background: 'var(--primary)', margin: '0 auto 10px' }}></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading active dispatches...</p>
              </div>
            ) : (
              <div>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No active orders placed yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {orders.map(o => {
                      const gpsMatch = o.address.match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
                      const lat = gpsMatch ? parseFloat(gpsMatch[1]) : null;
                      const lng = gpsMatch ? parseFloat(gpsMatch[2]) : null;
                      const cleanAddress = o.address.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, '');

                      return (
                        <div key={o.id} className="admin-order-row">
                          <div className="admin-order-header">
                            <span style={{ fontWeight: 700 }}>ID: {o.id}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.date} @ {o.timestamp}</span>
                          </div>

                          <div style={{ fontSize: '0.85rem' }}>
                            <div><strong>Customer:</strong> {o.customerName} ({o.phone})</div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <strong>Address:</strong> {cleanAddress}
                              {lat !== null && lng !== null && (
                                <button
                                  onClick={() => setActiveMapCoords({ lat, lng })}
                                  style={{
                                    padding: '2px 8px',
                                    backgroundColor: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: '1px solid var(--primary)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <MapPinIcon size={10} /> View Map
                                </button>
                              )}
                            </div>
                            <div style={{ marginTop: '6px', padding: '8px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                              <strong>Items:</strong>
                              {o.items.map((it, idx) => (
                                <div key={idx} style={{ color: 'var(--text-muted)' }}>
                                  • {it.qty}x {it.name} (${it.price.toFixed(2)})
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="admin-order-footer">
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payable:</span>
                              <strong style={{ fontSize: '0.95rem', color: 'var(--primary)', marginLeft: '4px' }}>${o.total.toFixed(2)}</strong>
                            </div>

                            {/* Status Select update */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Rider Status:</span>
                              <select 
                                className="status-dropdown"
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Catalog Manager list */}
          <div className="admin-table-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Catalog Items ({catalog.length})</h3>
              <button 
                onClick={() => handleOpenFoodModal(null)}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <PlusIcon size={12} /> Add Dish
              </button>
            </div>

            {loadingCatalog ? (
              <div style={{ padding: '30px 0', textAlign: 'center' }}>
                <div className="admin-pulse" style={{ background: 'var(--primary)', margin: '0 auto 10px' }}></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Opening catalog folder...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {catalog.map(item => {
                  const storeName = restaurants.find(r => r.id === item.restaurant_id)?.name || 'Store';
                  return (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={item.img} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>{item.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{storeName} | ${item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => handleOpenFoodModal(item)}
                          style={{ color: '#1976D2', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteFoodItem(item.id)}
                          style={{ color: '#D32F2F', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Save Food Modal */}
        {showFoodModal && (
          <div className="modal-backdrop">
            <div className="modal-container">
              <div className="modal-header">
                <span className="modal-title">{editingItem ? 'Edit Catalog Food' : 'Add Food Item'}</span>
                <button className="modal-close-btn" onClick={() => setShowFoodModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveFoodItem}>
                  <div className="form-group">
                    <label className="form-label">Associated Store / Restaurant</label>
                    <select 
                      className="form-input"
                      value={formRestaurantId}
                      onChange={(e) => setFormRestaurantId(e.target.value)}
                    >
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dish Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      placeholder="e.g. Tandoori Roti"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Describe recipe contents..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        required
                        placeholder="e.g. 9.99"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        <option value="burgers">Burgers</option>
                        <option value="pizza">Pizza</option>
                        <option value="indian">Indian</option>
                        <option value="asian">Asian</option>
                        <option value="bakery">Bakery</option>
                        <option value="groceries">Groceries</option>
                        <option value="salad">Salads</option>
                        <option value="drinks">Drinks</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Image URL / Path</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formImg}
                      onChange={(e) => setFormImg(e.target.value)}
                      placeholder="/assets/butter_masala.png"
                    />
                  </div>

                  <button type="submit" className="form-submit-btn" style={{ width: '100%' }}>
                    Save Catalog Item
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifier */}
        {toastMsg && (
          <div className="toast-msg" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <SparklesIcon size={14} /> {toastMsg}
          </div>
        )}
      </div>

      {/* Admin Map View overlay modal */}
      {activeMapCoords && (
        <MapSelector
          onClose={() => setActiveMapCoords(null)}
          onConfirm={() => {}}
          initialLat={activeMapCoords.lat}
          initialLng={activeMapCoords.lng}
          readOnly={true}
        />
      )}
    </>
  );
}
