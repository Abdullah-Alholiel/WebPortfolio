'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PersonalInfo {
  cvLink?: string;
  introText?: string;
  aboutText?: string;
  contactEmail?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  profileImageUrl?: string;
}

interface PortfolioData {
  personal: PersonalInfo | null;
  projects: any[];
  experiences: any[];
  skills: any;
  achievements: any[];
  mentorship: any[];
}

interface PortfolioDataContextType {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>({
    personal: null,
    projects: [],
    experiences: [],
    skills: {},
    achievements: [],
    mentorship: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);

  // Environment-based polling interval
  // Production: 30 seconds (30000ms) - faster updates for admin changes
  // Development: 10 seconds (10000ms) - very fast for testing
  const POLLING_INTERVAL = process.env.NODE_ENV === 'production' ? 30000 : 10000;
  
  // Stale-while-revalidate: Consider data stale after 20 seconds in prod, 5s in dev
  // Reduced thresholds to ensure fresh data appears quickly
  const STALE_THRESHOLD = process.env.NODE_ENV === 'production' ? 20000 : 5000;

  const fetchData = async (force = false) => {
    // Request deduplication: prevent concurrent fetches
    if (isFetching && !force) {
      return;
    }

    // Stale-while-revalidate: if data is fresh, don't refetch (unless forced)
    const now = Date.now();
    if (!force && lastFetchTime > 0 && (now - lastFetchTime) < STALE_THRESHOLD) {
      return;
    }

    setIsFetching(true);
    try {
      setError(null);
      const response = await fetch('/api/data', {
        // Force fresh data fetch - bypass all caches
        cache: 'no-store', // No caching - always fetch fresh data from Upstash
        headers: {
          // Add timestamp to prevent any caching
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      const result = await response.json();
      setData({
        personal: result.personal || null,
        projects: result.projects || [],
        experiences: result.experiences || [],
        skills: result.skills || {},
        achievements: result.achievements || [],
        mentorship: result.mentorship || [],
      });
      setLastFetchTime(now);
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Only set loading to false on initial load, not on subsequent errors
      if (loading) {
        setLoading(false);
      }
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData(true);
    
    // Refetch periodically to get updates from admin
    const interval = setInterval(() => {
      fetchData(false);
    }, POLLING_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  // Refetch function that forces a new request
  const refetch = async () => {
    await fetchData(true);
  };

  return (
    <PortfolioDataContext.Provider value={{ data, loading, error, refetch }}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (context === undefined) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return context;
}

