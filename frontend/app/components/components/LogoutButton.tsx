"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    try {
      // Clear authentication tokens
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Clear any other user-related data
      localStorage.removeItem('user');
      
      // Redirect to login page
      router.push('/login');
      
      // Optional: Force a full page reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Logout
    </button>
  );
};