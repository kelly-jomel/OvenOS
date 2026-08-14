'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type BakeryContextType = {
  currencySymbol: string;
  country: string;
  profile: any | null;
};

const BakeryContext = createContext<BakeryContextType>({
  currencySymbol: '₹',
  country: 'IN',
  profile: null,
});

export const BakeryProvider = ({ children }: { children: React.ReactNode }) => {
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [country, setCountry] = useState('IN');
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await api.get('/profile/');
          setProfile(res.data);
          const userCountry = res.data.country || 'IN';
          setCountry(userCountry);
          
          if (userCountry === 'US') setCurrencySymbol('$');
          else if (userCountry === 'GB') setCurrencySymbol('£');
          else setCurrencySymbol('₹'); // Default IN
        } catch (error) {
          console.error("Failed to fetch bakery profile for context", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BakeryContext.Provider value={{ currencySymbol, country, profile }}>
      {children}
    </BakeryContext.Provider>
  );
};

export const useBakery = () => useContext(BakeryContext);
