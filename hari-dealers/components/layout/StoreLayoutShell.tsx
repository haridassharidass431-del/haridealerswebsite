'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from '@/components/navbar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import MobileNav from '@/components/navbar/MobileNav';
import Footer from '@/components/footer/Footer';
import FloatingWhatsAppButton from '@/components/layout/FloatingWhatsAppButton';
import WelcomeDialog from '@/components/layout/WelcomeDialog';

export default function StoreLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="min-h-screen bg-charcoal-900 text-ivory">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal-900">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <MobileNav />
      <FloatingWhatsAppButton />
      <WelcomeDialog />
    </div>
  );
}
