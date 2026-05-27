'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

interface UserContextType {
  user: UserProfile;
  address: string;
  phone: string;
  savedAddresses: string[];
  activeOrderId: string | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  updateAddress: (newAddr: string) => void;
  addAddress: (newAddr: string) => void;
  updatePhone: (newPhone: string) => void;
  setActiveOrderId: (id: string | null) => void;
}

const defaultUser: UserProfile = {
  name: 'Rachal Smith',
  email: 'rachalsmith@gmail.com',
  isLoggedIn: true // Auto-login for prototype ease, can toggle
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [address, setAddress] = useState("2464 Royal Ln. Mesa, New Jersey");
  const [phone, setPhone] = useState("(821) 784-621");
  const [savedAddresses, setSavedAddresses] = useState<string[]>([
    "2464 Royal Ln. Mesa, New Jersey",
    "1386 Sydney, South Wales, Australia"
  ]);
  const [activeOrderId, setActiveOrderIdState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bitecraft_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedAddress = localStorage.getItem('bitecraft_address');
    if (savedAddress) {
      setAddress(savedAddress);
    }
    const savedPhone = localStorage.getItem('bitecraft_phone');
    if (savedPhone) {
      setPhone(savedPhone);
    }
    const savedAddressList = localStorage.getItem('bitecraft_saved_addresses');
    if (savedAddressList) {
      setSavedAddresses(JSON.parse(savedAddressList));
    }
    const savedActiveOrder = localStorage.getItem('bitecraft_active_order_id');
    if (savedActiveOrder) {
      setActiveOrderIdState(savedActiveOrder);
    }
  }, []);

  const login = (name: string, email: string) => {
    const newUser = { name, email, isLoggedIn: true };
    setUser(newUser);
    localStorage.setItem('bitecraft_user', JSON.stringify(newUser));
  };

  const logout = () => {
    const clearedUser = { name: '', email: '', isLoggedIn: false };
    setUser(clearedUser);
    localStorage.setItem('bitecraft_user', JSON.stringify(clearedUser));
  };

  const updateAddress = (newAddr: string) => {
    setAddress(newAddr);
    localStorage.setItem('bitecraft_address', newAddr);
    
    // Add to saved addresses if not already there
    if (!savedAddresses.includes(newAddr)) {
      addAddress(newAddr);
    }
  };

  const addAddress = (newAddr: string) => {
    const updated = [...savedAddresses, newAddr];
    setSavedAddresses(updated);
    localStorage.setItem('bitecraft_saved_addresses', JSON.stringify(updated));
  };

  const updatePhone = (newPhone: string) => {
    setPhone(newPhone);
    localStorage.setItem('bitecraft_phone', newPhone);
  };

  const setActiveOrderId = (id: string | null) => {
    setActiveOrderIdState(id);
    if (id) {
      localStorage.setItem('bitecraft_active_order_id', id);
    } else {
      localStorage.removeItem('bitecraft_active_order_id');
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      address,
      phone,
      savedAddresses,
      activeOrderId,
      login,
      logout,
      updateAddress,
      addAddress,
      updatePhone,
      setActiveOrderId
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
