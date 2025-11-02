'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import './admin-styles.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has admin session
    const checkAuth = async () => {
      try {
        console.log('Checking admin auth...');
        const response = await fetch('/api/admin/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        console.log('Auth check response status:', response.status);

        if (!response.ok) {
          console.log('Not authenticated, redirecting to login');
          router.push('/admin/login');
          return;
        }

        console.log('Authenticated!');
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  useEffect(() => {
    // Force apply styles as fallback if CSS hasn't loaded yet
    if (typeof window !== 'undefined') {
      // Force input styles for admin pages
      const fixInputs = () => {
        const isDark = document.documentElement.classList.contains('dark');
        document.querySelectorAll('input, textarea, select').forEach((el: any) => {
          if (el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'button' && el.type !== 'submit') {
            el.style.backgroundColor = isDark ? '#374151' : '#ffffff';
            el.style.color = isDark ? '#ffffff' : '#111827';
          }
        });
      };
      
      fixInputs();
      setTimeout(() => { fixInputs(); }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminLayout />
    </div>
  );
}

