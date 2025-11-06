'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import '../admin-styles.css';

export default function AdminVerify() {
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple verification attempts (React Strict Mode in dev causes double renders)
    if (verificationAttempted.current) {
      return;
    }

    // If there's an email but no token, show "check your email" success message
    if (email && !token) {
      setStatus('waiting');
      return;
    }

    // If no token at all, show error
    if (!token) {
      setStatus('error');
      setErrorMessage('No token provided');
      return;
    }

    // Mark verification as attempted
    verificationAttempted.current = true;

    // Set status to verifying when token is present
    setStatus('verifying');

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
        {status === 'waiting' && (
          <>
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Click the link in your email to access the admin dashboard.
            </p>
            <button
              onClick={() => router.push('/admin/login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Back to Login
            </button>
          </>
        )}

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
      </div>
    </div>
  );
}

