'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { StarIcon, PlusIcon, TrashIcon, PackageIcon, SparklesIcon, FolderIcon, CameraIcon, UserIcon, CalendarIcon } from '@/components/Icons';

const avatarPresets = [
  { id: 'default', img: '/assets/user_avatar.png', label: 'Default' },
  { id: 'mango', img: '/assets/mango_icon.png', label: 'Mango' },
  { id: 'pizza', img: '/assets/categories/pizza_cat.png', label: 'Pizza' },
  { id: 'burger', img: '/assets/categories/burger_cat.png', label: 'Burger' },
  { id: 'bakery', img: '/assets/categories/bakery_cat.png', label: 'Bakery' },
  { id: 'drinks', img: '/assets/categories/drinks_cat.png', label: 'Drinks' },
  { id: 'indian', img: '/assets/categories/indian_cat.png', label: 'Curry' },
  { id: 'asian', img: '/assets/categories/asian_cat.png', label: 'Noodles' },
  { id: 'salad', img: '/assets/categories/salad_cat.png', label: 'Salad' },
  { id: 'grocery', img: '/assets/categories/grocery_cat.png', label: 'Groceries' }
];

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
  status: string;
  timestamp: string;
  date?: string;
  paymentMethod?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { 
    user, 
    address, 
    phone, 
    savedAddresses, 
    login, 
    logout, 
    addAddress, 
    deleteAddress, 
    updateAddress, 
    updatePhone, 
    updateProfile 
  } = useUser();

  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(phone);
  const [profileBio, setProfileBio] = useState(user.bio || '');
  const [profileDob, setProfileDob] = useState(user.dob || '');
  const [profileGender, setProfileGender] = useState(user.gender || '');
  const [profileFavFood, setProfileFavFood] = useState(user.favoriteFood || 'pizza');
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Sync state values with Context loaded values on client mount
  useEffect(() => {
    setProfileName(user.name);
    setProfileEmail(user.email);
    setProfileBio(user.bio || '');
    setProfileDob(user.dob || '');
    setProfileGender(user.gender || '');
    setProfileFavFood(user.favoriteFood || 'pizza');
  }, [user]);

  useEffect(() => {
    setProfilePhone(phone);
  }, [phone]);

  // Fetch Order History (both Supabase orders matching name & local backup history)
  useEffect(() => {
    async function loadOrderHistory() {
      // 1. Load from localStorage history backup
      let historyList: Order[] = [];
      const historyStr = localStorage.getItem('bitecraft_orders_history') || '[]';
      try {
        historyList = JSON.parse(historyStr);
      } catch (e) {}

      // 2. Load from Supabase and merge
      try {
        const supabase = createClient();
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (orders && orders.length > 0) {
          const dbOrders: Order[] = [];
          for (const row of orders) {
            // Get items for this order
            const { data: itemRows } = await supabase
              .from('order_items')
              .select('qty, price, catalog(name)')
              .eq('order_id', row.id);

            const items: OrderItem[] = (itemRows || []).map((ir: any) => ({
              id: ir.item_id || "",
              name: ir.catalog?.name || "Dish Item",
              qty: ir.qty,
              price: parseFloat(ir.price)
            }));

            dbOrders.push({
              id: row.id,
              customerName: row.customer_name,
              address: row.address,
              phone: row.phone,
              items: items,
              subtotal: parseFloat(row.subtotal || 0),
              discount: parseFloat(row.discount || 0),
              total: parseFloat(row.total),
              status: row.status,
              paymentMethod: row.payment_method || 'COD',
              timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(row.created_at).toLocaleDateString()
            });
          }

          // Merge collections by ID, prioritizing DB records
          const mergedMap = new Map<string, Order>();
          historyList.forEach(o => mergedMap.set(o.id, o));
          dbOrders.forEach(o => mergedMap.set(o.id, o));
          
          setOrdersHistory(Array.from(mergedMap.values()).sort((a,b) => b.id.localeCompare(a.id)));
          return;
        }
      } catch (err) {
        console.log("Profile database fetch failed. Displaying local history log.");
      }

      setOrdersHistory(historyList);
    }

    loadOrderHistory();
  }, [user.name]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    login(profileName, profileEmail);
    updatePhone(profilePhone);
    updateProfile({
      bio: profileBio,
      dob: profileDob,
      gender: profileGender,
      favoriteFood: profileFavFood
    });
    showToast('Profile information saved!');
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddressInput.trim() !== '') {
      addAddress(newAddressInput.trim());
      updateAddress(newAddressInput.trim());
      setNewAddressInput('');
      setShowAddressModal(false);
      showToast('Address added and selected!');
    }
  };

  const handleDeleteAddress = (e: React.MouseEvent, addr: string) => {
    e.stopPropagation(); // Avoid selecting deleted address
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddress(addr);
      showToast('Address deleted!');
    }
  };

  const handleLogoutClick = () => {
    logout();
    router.push('/auth');
  };

  const handleSelectPresetAvatar = (preset: string) => {
    updateProfile({ avatar: preset });
    showToast('Profile avatar updated!');
    setShowAvatarModal(false);
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateProfile({ avatar: reader.result });
          showToast('Custom profile picture uploaded!');
          setShowAvatarModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'pending';
      case 'preparing': return 'preparing';
      case 'out for delivery': return 'delivery';
      case 'delivered': return 'delivered';
      default: return 'pending';
    }
  };

  const renderAvatarContent = () => {
    const avatarStr = user.avatar || '/assets/user_avatar.png';
    if (!avatarStr.startsWith('/') && !avatarStr.startsWith('data:')) {
      // Emoji representation
      return (
        <div className="avatar-emoji-container">
          {avatarStr}
        </div>
      );
    }
    return <img src={avatarStr} alt="User profile avatar" className="avatar-img" />;
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>User Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your address catalog, profile details, and track orders.</p>
      </div>

      <div className="profile-grid">
        
        {/* Left Column: Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="profile-card">
            <div className="avatar-wrapper" onClick={() => setShowAvatarModal(true)} title="Click to customize avatar">
              {renderAvatarContent()}
              <div className="avatar-edit-overlay">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CameraIcon size={14} /> Customize</span>
              </div>
            </div>
            
            <h3 className="profile-name">{user.isLoggedIn ? user.name : 'Sign In'}</h3>
            <p className="profile-email">{user.isLoggedIn ? user.email : 'To manage addresses and trace checkout history'}</p>
            
            {user.isLoggedIn && (
              <>
                {user.bio && (
                  <p className="profile-card-bio">"{user.bio}"</p>
                )}
                
                <div className="profile-card-badge-row">
                  {user.favoriteFood && (
                    <span className="profile-card-badge fav-food" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><StarIcon size={12} /> {user.favoriteFood}</span>
                  )}
                  {user.gender && (
                    <span className="profile-card-badge gender" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><UserIcon size={12} /> {user.gender}</span>
                  )}
                  {user.dob && (
                    <span className="profile-card-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CalendarIcon size={12} /> {new Date(user.dob).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  )}
                </div>
              </>
            )}

            {user.isLoggedIn ? (
              <>
                <button onClick={handleLogoutClick} className="profile-logout-btn">
                  Log Out Profile
                </button>
                <Link href="/admin" style={{ display: 'block', marginTop: '12px' }}>
                  <button className="checkout-btn" style={{ background: 'var(--accent)', padding: '10px', width: '100%', fontSize: '0.85rem' }}>
                    Open Admin Dashboard
                  </button>
                </Link>
              </>
            ) : (
              <Link href="/auth" style={{ display: 'block' }}>
                <button className="checkout-btn" style={{ padding: '10px' }}>
                  Sign In Account
                </button>
              </Link>
            )}
          </div>

          {/* Form edits */}
          {user.isLoggedIn && (
            <div className="profile-card" style={{ textAlign: 'left' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '14px' }}>Edit Details</h4>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={profileDob}
                      onChange={(e) => setProfileDob(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-input"
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Favorite Cuisine</label>
                  <select
                    className="form-input"
                    value={profileFavFood}
                    onChange={(e) => setProfileFavFood(e.target.value)}
                  >
                    <option value="burgers">Burgers</option>
                    <option value="pizza">Pizza</option>
                    <option value="indian">Indian</option>
                    <option value="asian">Asian Fusion</option>
                    <option value="bakery">Bakery & Sweets</option>
                    <option value="groceries">Groceries</option>
                    <option value="salad">Salads</option>
                    <option value="drinks">Drinks & Cafe</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio / Profile Greeting</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Tell us about yourself..."
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="form-submit-btn" style={{ width: '100%' }}>
                  Save Profile Info
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Address book and orders history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Saved Addresses list */}
          <div className="profile-card" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontWeight: 700 }}>Saved Addresses Catalog</h4>
              <button 
                onClick={() => setShowAddressModal(true)}
                style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <PlusIcon size={12} /> Add Address
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedAddresses.map((addr, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    updateAddress(addr);
                    showToast('Primary address selected!');
                  }}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: address === addr ? 'var(--primary-light)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: address === addr ? 'var(--primary)' : 'inherit' }}>
                    {addr}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {address === addr && (
                      <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                        Primary
                      </span>
                    )}
                    <button 
                      onClick={(e) => handleDeleteAddress(e, addr)}
                      className="address-delete-btn"
                      title="Delete Address"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders History List */}
          <div className="profile-card" style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>Placed Order Logs</h4>
            
            {ordersHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <PackageIcon size={40} style={{ color: 'var(--text-muted)' }} />
                <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>No orders found in checkout history.</p>
              </div>
            ) : (
              <div className="order-history-list">
                {ordersHistory.map(o => (
                  <div key={o.id} className="history-card">
                    <div className="history-card-header">
                      <div>
                        <span className="history-order-id">Order ID: {o.id}</span>
                        <span className="history-order-date" style={{ marginLeft: '10px' }}>
                          {o.date || 'Today'} @ {o.timestamp}
                        </span>
                      </div>
                      <span className={`status-indicator ${getStatusClass(o.status)}`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="history-card-body">
                      <div className="history-items-list">
                        {o.items.map((it, idx) => (
                          <div key={idx}>
                            • {it.qty}x {it.name} (${it.price.toFixed(2)})
                          </div>
                        ))}
                      </div>

                      <div className="history-totals-col">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Paid Amount</span>
                        <span className="history-total-price">${o.total.toFixed(2)}</span>
                        
                        <Link href={`/order-tracking/${o.id}`} style={{ display: 'block', marginTop: '6px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          Track Delivery {"→"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Toast Notifier */}
      {toastMsg && (
        <div className="toast-msg" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <SparklesIcon size={14} /> {toastMsg}
        </div>
      )}

      {/* Address Form modal */}
      {showAddressModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <span className="modal-title">New Delivery Address</span>
              <button className="modal-close-btn" onClick={() => setShowAddressModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddNewAddress}>
                <div className="form-group">
                  <label className="form-label">Full Location Address Details</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter street, building, city..."
                    value={newAddressInput}
                    onChange={(e) => setNewAddressInput(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="form-submit-btn" style={{ width: '100%' }}>
                  Save Location
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customize Avatar Modal */}
      {showAvatarModal && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <span className="modal-title">Customize Avatar</span>
              <button className="modal-close-btn" onClick={() => setShowAvatarModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <label className="avatar-upload-input-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <FolderIcon size={16} /> Upload Custom Picture
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCustomAvatarUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
              <div style={{ textAlign: 'center', margin: '14px 0 6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Or choose a preset theme:
              </div>
              <div className="avatar-presets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {avatarPresets.map((preset) => (
                  <button 
                    key={preset.id}
                    className={`avatar-preset-btn ${user.avatar === preset.img ? 'selected' : ''}`}
                    onClick={() => handleSelectPresetAvatar(preset.img)}
                    style={{ padding: '4px', borderRadius: '50%', overflow: 'hidden', border: user.avatar === preset.img ? '2.5px solid var(--primary)' : '1px solid var(--border-color)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--bg-main)' }}
                    title={preset.label}
                  >
                    <img src={preset.img} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
