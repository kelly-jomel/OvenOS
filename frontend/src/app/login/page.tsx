'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      let email = '';
      let displayName = '';
      let uid = '';

      // Use Native Capacitor Plugin if on iOS/Android, otherwise use standard web popup
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        email = result.user?.email || '';
        displayName = result.user?.displayName || 'My';
        uid = result.user?.uid || '';
      } else {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        email = result.user.email || '';
        displayName = result.user.displayName || 'My';
        uid = result.user.uid;
      }
      
      // Attempt to register the user in our backend
      // If they already exist, this will gracefully fail and we just proceed
      try {
        await api.post('/users/', {
          email: email,
          bakery_name: `${displayName} Bakery`.trim(),
          firebase_uid: uid
        });
      } catch (apiErr) {
        console.log('User might already exist in backend, continuing...');
      }
      
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-4">
          <img src="/logo.png" alt="CrumbLedger Logo" className="h-16 w-auto object-contain drop-shadow-md" />
          <h1 className="text-4xl sm:text-5xl leading-tight flex items-baseline">
            <span className="font-brand font-semibold tracking-tight text-ledger-navy">Crumb</span>
            <span className="font-data tracking-[0.15em] font-light text-ledger-navy/80">Ledger</span>
          </h1>
        </div>
        <h2 className="mt-4 text-center text-2xl font-brand font-medium text-ink-grey">
          Welcome to CrumbLedger
        </h2>
        <p className="mt-2 text-center text-sm font-data text-ink-grey/70">
          Sign in or create an account to manage your bakery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow-sm rounded-md sm:px-10 border border-gray-200 flex flex-col items-center">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm w-full mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-brand font-semibold text-ledger-navy bg-jupiter-gold hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jupiter-gold disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-ledger-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting to Google...
              </span>
            ) : (
              <>
                <img className="h-6 w-6 mr-3 bg-white p-1 rounded-full" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                Continue with Google
              </>
            )}
          </button>
          
          <p className="mt-6 text-xs text-center font-data text-ink-grey/50">
            By continuing, you agree to CrumbLedger's Terms of Service and Privacy Policy.
          </p>

        </div>
      </div>
    </div>
  );
}
