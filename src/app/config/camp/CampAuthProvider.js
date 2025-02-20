"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from "@campnetwork/sdk/react";

const CampAuthContext = createContext({
  linkedSocials: null,
  isLoadingSocials: false,
  refetchSocials: async () => {},
});

export const useCampAuth = () => {
  const context = useContext(CampAuthContext);
  if (!context) {
    throw new Error('useCampAuth must be used within a CampAuthProvider');
  }
  return context;
};

export const CampAuthProvider = ({ children }) => {
  const [linkedSocials, setLinkedSocials] = useState(null);
  const [isLoadingSocials, setIsLoadingSocials] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { isConnected } = useAccount();
  const auth = useAuth();
  
  const fetchingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  const fetchSocials = useCallback(async (force = false) => {
    // Return early if already fetching, no auth instance, or not connected
    if ((fetchingRef.current && !force) || !auth || !isConnected) return;
    
    try {
      fetchingRef.current = true;
      setIsLoadingSocials(true);
      
      // Explicitly wait for a fresh response from the server
      const socials = await auth.getLinkedSocials({
        cache: 'no-store',
        timestamp: Date.now() // Force fresh request
      });
      
      setLinkedSocials(socials);
      initialLoadDoneRef.current = true;
      
      // Reset retry count on success
      if (retryCount > 0) {
        setRetryCount(0);
      }
      
    } catch (error) {
      console.error('Error fetching socials:', error);
      
      // If we haven't loaded initially, retry a few times
      if (!initialLoadDoneRef.current && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchingRef.current = false;
          fetchSocials(true);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      }
      
      // Don't null out existing data on refresh failure
      if (!linkedSocials) {
        setLinkedSocials(null);
      }
    } finally {
      setIsLoadingSocials(false);
      fetchingRef.current = false;
    }
  }, [auth, isConnected, retryCount, linkedSocials]);

  // Initial load when component mounts or connection changes
  useEffect(() => {
    if (!isConnected) {
      setLinkedSocials(null);
      initialLoadDoneRef.current = false;
      return;
    }

    // Only fetch if we haven't done initial load
    if (!initialLoadDoneRef.current) {
      fetchSocials();
    }
  }, [isConnected, fetchSocials]);

  // URL parameter check for when returning from auth flow
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hasSocialParam = params.has('social');
    const hasAuthParam = params.has('auth') || params.has('code');
    
    if ((hasSocialParam || hasAuthParam) && isConnected) {
      // Clear fetchingRef to ensure we can fetch again
      fetchingRef.current = false;
      fetchSocials(true);
      
      // Clean up URL if needed
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname + 
          (window.location.search.replace(/[?&](social|auth|code)=[^&]*/g, '').replace(/^\?$/, ''));
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [isConnected, fetchSocials]);

  const value = {
    linkedSocials,
    isLoadingSocials,
    refetchSocials: () => fetchSocials(true), // Force refresh
  };

  return (
    <CampAuthContext.Provider value={value}>
      {children}
    </CampAuthContext.Provider>
  );
};

export default CampAuthProvider;