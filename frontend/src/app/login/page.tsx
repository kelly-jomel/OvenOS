'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let email = '';
      let uid = '';
      
      if (isRegistering) {
        // Register
        const result = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        email = result.user.email || '';
        uid = result.user.uid;
        
        // Attempt to register the user in our backend
        try {
          await api.post('/users/', {
            email: email,
            bakery_name: `${email.split('@')[0]}'s Bakery`,
            firebase_uid: uid
          });
        } catch (apiErr) {
          console.log('Backend registration skipped or failed');
        }
      } else {
        // Login
        const result = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        email = result.user.email || '';
        uid = result.user.uid;
      }
      
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-4">
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
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jupiter-gold disabled:opacity-50 transition-all mb-6"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <>
                <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                Continue with Google
              </>
            )}
          </button>
          
          <div className="relative w-full mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jupiter-gold focus:border-jupiter-gold sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-jupiter-gold focus:border-jupiter-gold sm:text-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-ledger-navy bg-jupiter-gold hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jupiter-gold disabled:opacity-50 transition-all"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-sm w-full text-center">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-ledger-navy hover:underline font-medium"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
          
          <p className="mt-6 text-xs text-center font-data text-ink-grey/50">
            By continuing, you agree to CrumbLedger's Terms of Service and Privacy Policy.
          </p>

        </div>
      </div>
    </div>
  );
}
