import "./globals.css";
import ClientLayout from "@/components/client-layout";

const themeInitializer = `(() => {
  try {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = storedTheme ? storedTheme === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', shouldUseDark);
  } catch (error) {
    console.warn('Theme initialization failed', error);
  }
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="bg-gray-50 text-gray-950 relative dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializer }}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
