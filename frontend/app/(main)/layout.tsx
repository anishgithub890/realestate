'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { authService } from '@/lib/auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Wait for auth state to be initialized
    const checkAuth = () => {
      const hasToken = authService.isAuthenticated();
      const hasReduxAuth = isAuthenticated;
      
      if (!hasToken && !hasReduxAuth) {
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    };

    // Small delay to allow Redux state to initialize
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Second useEffect - must be before any conditional returns
  useEffect(() => {
    if (!loading && !isAuthenticated && !authService.isAuthenticated()) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isChecking || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (will redirect)
  if (!isAuthenticated && !authService.isAuthenticated()) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

