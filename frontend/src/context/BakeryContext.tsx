'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type BakeryContextType = {
  currencySymbol: string;
  country: string;
  profile: any | null;
  refreshProfile: () => Promise<void>;
};

const BakeryContext = createContext<BakeryContextType>({
  currencySymbol: '₹',
  country: 'IN',
  profile: null,
  refreshProfile: async () => {},
});

export const BakeryProvider = ({ children }: { children: React.ReactNode }) => {
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [country, setCountry] = useState('IN');
  const [profile, setProfile] = useState<any | null>(null);

  const fetchProfileData = async () => {
    try {
      // Aggressive 3-second timeout for instant UI loading
      const res = await api.get('/profile/', { timeout: 3000 });
      setProfile(res.data);
      const userCountry = res.data.country || 'IN';
      setCountry(userCountry);
      
      if (userCountry === 'US') setCurrencySymbol('$');
      else if (userCountry === 'GB') setCurrencySymbol('£');
      else setCurrencySymbol('₹'); // Default IN
    } catch (error) {
      console.warn("Profile API slow or failed. Using fallback for instant load...", error);
      // Fallback so the app doesn't freeze
      if (auth.currentUser) {
        setProfile((prev: any) => prev || { id: auth.currentUser?.uid, fallback: true });
        
        // Fetch in background to update preferences when the server finally wakes up
        api.get('/profile/').then((res) => {
          setProfile(res.data);
          const userCountry = res.data.country || 'IN';
          setCountry(userCountry);
          if (userCountry === 'US') setCurrencySymbol('$');
          else if (userCountry === 'GB') setCurrencySymbol('£');
          else setCurrencySymbol('₹');
        }).catch((e) => console.error("Background profile fetch failed", e));
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchProfileData();
      } else {
        // If not logged in, redirect to login unless on public pages
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup') && !window.location.pathname.startsWith('/order')) {
          window.location.href = '/login';
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BakeryContext.Provider value={{ currencySymbol, country, profile, refreshProfile: fetchProfileData }}>
      {children}
    </BakeryContext.Provider>
  );
};

export const useBakery = () => useContext(BakeryContext);
