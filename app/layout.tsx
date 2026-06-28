import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css'; // Global styles

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Resume Builder & CV Document Creator',
  description: 'An elegant, offline-ready professional resume and CV document builder featuring high-fidelity PDF and Word exports, customizable templates, and smart assistance.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CV Builder',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      keys.forEach(function(key) {
                        caches.delete(key);
                      });
                    });
                  }
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      registrations.forEach(function(registration) {
                        registration.unregister().then(function(unregistered) {
                          if (unregistered) {
                            console.log('[Service Worker] Cleaned up stale registration on layout mount');
                            window.location.reload();
                          }
                        });
                      });
                    });
                  }
                } catch (e) {
                  console.error('[Cache Clean] Error running inline cache buster:', e);
                }
              })();
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
