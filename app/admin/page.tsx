'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import './admin-styles.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Check if user has admin session
    const checkAuth = async () => {
      try {
        console.log('[Admin] Checking authentication...');
        const response = await fetch('/api/admin/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        console.log('[Admin] Auth check response status:', response.status);
        console.log('[Admin] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('[Admin] Not authenticated:', errorData);
          console.log('[Admin] Redirecting to login...');
          router.push('/admin/login');
          return;
        }

        const data = await response.json().catch(() => ({}));
        console.log('[Admin] Authenticated successfully:', data);
        setLoading(false);
      } catch (error) {
        console.error('[Admin] Auth check error:', error);
        console.error('[Admin] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        toast.error('Failed to verify authentication');
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Only run style fixes after component is mounted and not loading
    if (!loading && typeof window !== 'undefined') {
      console.log('[Admin] Applying style fixes...');
      // Force apply styles as fallback if CSS hasn't loaded yet
      const fixInputs = () => {
        try {
          const isDark = document.documentElement.classList.contains('dark');
          const inputs = document.querySelectorAll('input, textarea, select');
          console.log(`[Admin] Found ${inputs.length} form elements to style`);
          
          inputs.forEach((el: any) => {
            if (el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'button' && el.type !== 'submit') {
              el.style.backgroundColor = isDark ? '#374151' : '#ffffff';
              el.style.color = isDark ? '#ffffff' : '#111827';
            }
          });
        } catch (styleError) {
          console.warn('[Admin] Error applying styles:', styleError);
        }
      };
      
      fixInputs();
      setTimeout(() => { fixInputs(); }, 100);
    }
  }, [loading]);

  // Conditional return after all hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminLayout />
    </div>
  );
}

