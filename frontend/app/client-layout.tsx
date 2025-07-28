// app/client-layout.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';

interface User {
  username: string;
  department: string;
  bb_total: number;
  bb_locked: number;
}

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup'];
  const isPublicPath = publicPaths.includes(pathname);
  const isPlaygroundPage = pathname.startsWith('/playground/');

  const [user, setUser] = useState<User | null>(null);
  const [totalBB, setTotalBB] = useState(0);
  const [loading, setLoading] = useState(!isPublicPath);

  // Single useEffect for auth
useEffect(() => {
  if (isPublicPath) return;

  const verifyAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const [userRes, marketRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          headers: {'Authorization': `Bearer ${token}`}
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bet/market-total`, {
          headers: {'Authorization': `Bearer ${token}`}
        })
      ]);

      if (!userRes.ok || !marketRes.ok) throw new Error('Auth failed');
      
      const [me, { totalBB }] = await Promise.all([userRes.json(), marketRes.json()]);
      
      setUser(me);
      setTotalBB(totalBB);
    } catch (err) {
      localStorage.removeItem('authToken');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  verifyAuth();
}, [pathname, router, isPublicPath]);
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="fixed top-0 w-full z-50">
        <Navbar
          isLoggedIn={!!user}
          user={user}
          totalBB={totalBB}
        />
      </header>

      <div className="flex-grow pt-16">
        {pathname === '/' && <Hero />}
        <main className="bg-black">
          {children}
        </main>
      </div>

      {!isPublicPath && !isPlaygroundPage && <Footer />}
    </div>
  );
}