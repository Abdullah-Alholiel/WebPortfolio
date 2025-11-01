'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminVerify() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // If there's an email but no token, show "check your email" message
    if (email && !token) {
      setStatus('error');
      setErrorMessage('Please check your email for the magic link.');
      return;
    }

    // If no token at all, show error
    if (!token) {
      setStatus('error');
      setErrorMessage('No token provided');
      return;
    }

    // Verify token
    const verifyToken = async () => {
      try {
        console.log('Verifying token:', token);
        const response = await fetch('/api/admin/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response text:', text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          setStatus('error');
          setErrorMessage('Invalid response from server');
          return;
        }

        console.log('Response data:', data);

        if (!response.ok) {
          setStatus('error');
          setErrorMessage(data.error || 'Verification failed');
          return;
        }

        setStatus('success');
        toast.success('Login successful!');

        // Redirect to admin dashboard
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      } catch (error) {
        setStatus('error');
        setErrorMessage('Failed to verify token');
        console.error('Error:', error);
      }
    };

    verifyToken();
  }, [token, email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your token
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Login Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to admin dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push('/admin/login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Try Again
            </button>
          </>
        )}

        {email && status === 'verifying' && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Checking your email... ({email})
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              If you have the token, it will be processed automatically
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

