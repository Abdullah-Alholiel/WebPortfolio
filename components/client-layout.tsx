'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from './header';
import Footer from './footer';
import ThemeSwitch from './theme-switch';
import ThemeContextProvider from '@/context/theme-context';
import ActiveSectionContextProvider from '@/context/active-section-context';
import { PortfolioDataProvider, usePortfolioData } from '@/context/portfolio-data-context';
import { Toaster } from 'react-hot-toast';
import ScrollProgressBar from './scroll-progress-bar';
import Loader from '@/components/ui/loader';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname ? pathname.startsWith('/admin') : false;

  useEffect(() => {
    const updateAdminClass = () => {
      if (typeof window !== 'undefined') {
        const body = document.body;
        const html = document.documentElement;
        if (isAdminPage) {
          body.classList.add('admin-page');
          html.classList.add('admin-page');
          body.style.setProperty('--admin-page', 'true');
        } else {
          body.classList.remove('admin-page');
          html.classList.remove('admin-page');
          body.style.removeProperty('--admin-page');
        }
      }
    };
    
    updateAdminClass();
    const timeoutId = setTimeout(updateAdminClass, 0);
    
    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== 'undefined') {
        document.body.classList.remove('admin-page');
        document.documentElement.classList.remove('admin-page');
      }
    };
  }, [isAdminPage, pathname]);

  return (
    <>
      <div className={isAdminPage ? '' : 'pt-28 sm:pt-36'}>
        {!isAdminPage && (
          <>
            <div className="bg-[#fbe2e3] absolute top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#946263]"></div>
            <div className="bg-[#dbd7fb] absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#676394]"></div>
            <ScrollProgressBar />
          </>
        )}
        
        <ThemeContextProvider>
          <PortfolioDataProvider>
            <ActiveSectionContextProvider>
              <PortfolioContentGate disabled={isAdminPage}>
                {isAdminPage ? null : <Header />}
                {children}
                {isAdminPage ? null : <Footer />}

                <Toaster position="top-right" />
                {!isAdminPage && <ThemeSwitch />}
              </PortfolioContentGate>
            </ActiveSectionContextProvider>
          </PortfolioDataProvider>
        </ThemeContextProvider>
      </div>
    </>
  );
}

function PortfolioContentGate({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { loading, error, refetch } = usePortfolioData();
  const loadingMessage = "Powering up my Portfolio... 🚀";

  if (disabled) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-12 text-center dark:bg-slate-950">
        <Loader label="Loading portfolio" />
        <p
          className="max-w-lg text-center text-sm font-bold uppercase tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-400 to-orange-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.25)]"
          aria-live="polite"
        >
          {loadingMessage}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-slate-950">
        <p className="text-base font-medium text-gray-800 dark:text-gray-100">
          We couldn’t load the portfolio data.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please check your connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

