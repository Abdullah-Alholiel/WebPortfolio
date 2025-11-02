'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from './header';
import Footer from './footer';
import ThemeSwitch from './theme-switch';
import ThemeContextProvider from '@/context/theme-context';
import ActiveSectionContextProvider from '@/context/active-section-context';
import { PortfolioDataProvider } from '@/context/portfolio-data-context';
import { Toaster } from 'react-hot-toast';
import ScrollProgressBar from './scroll-progress-bar';

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
              {isAdminPage ? null : <Header />}
              {children}
              {isAdminPage ? null : <Footer />}

              <Toaster position="top-right" />
              {!isAdminPage && <ThemeSwitch />}
            </ActiveSectionContextProvider>
          </PortfolioDataProvider>
        </ThemeContextProvider>
      </div>
    </>
  );
}

