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

  // Load from local storage immediately if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('bakeryProfile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setProfile(parsed);
          const userCountry = parsed.country || 'IN';
          setCountry(userCountry);
          if (userCountry === 'US') setCurrencySymbol('$');
          else if (userCountry === 'GB') setCurrencySymbol('£');
          else setCurrencySymbol('₹');
        } catch (e) {}
      }
    }
  }, []);

  const fetchProfileData = async () => {
    try {
      // Remove aggressive timeout since Render is upgraded, just fetch normally.
      // The cached local storage profile handles the instant UI.
      const res = await api.get('/profile/');
      setProfile(res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bakeryProfile', JSON.stringify(res.data));
      }
      const userCountry = res.data.country || 'IN';
      setCountry(userCountry);
      
      if (userCountry === 'US') setCurrencySymbol('$');
      else if (userCountry === 'GB') setCurrencySymbol('£');
      else setCurrencySymbol('₹'); // Default IN
    } catch (error) {
      console.error("Profile API failed.", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchProfileData();
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bakeryProfile');
        }
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