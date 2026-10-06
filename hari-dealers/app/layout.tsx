import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/store/store';
import { ToastProvider } from '@/components/ui/Toast';
import StoreLayoutShell from '@/components/layout/StoreLayoutShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'HARI DEALERS | Fashion, Xerox & Printing',
  description: 'Shop the latest Hari Dealers fashion and request convenient Xerox and printing services.',
  keywords: 'Hari Dealers, Girls Collection, Boys Collection, Tops, Fashion Tops, Shawls, Leggings, Ankle Fit, Palazzo',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'HARI DEALERS | Luxury Indian Fashion & Designer Dresses',
    description: 'Style That Speaks For You. Discover premium fashion styles at prices you will love.',
    images: ['/logo.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <StoreProvider>
          <ToastProvider>
            <StoreLayoutShell>
              {children}
            </StoreLayoutShell>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
