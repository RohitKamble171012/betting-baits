// Navbar.tsx (React Client Component)
"use client";
import Link from "next/link";
import { FaWallet, FaUser, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
}

interface NavbarProps {
  isLoggedIn: boolean;
  user: User | null;
  totalBB: number;
}

const Navbar = ({ isLoggedIn, user, totalBB }: NavbarProps) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
    router.refresh();
  };

  const AdminLinks = () => (
    <>
      <Link href="/admin/distribute" className="text-white hover:bg-orange-700/50 px-3 py-2 rounded-md">
        Distribute
      </Link>
      <Link href="/admin/results" className="text-white hover:bg-orange-700/50 px-3 py-2 rounded-md">
        Results
      </Link>
    </>
  );

  return (
    <header className="bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-white text-xl font-bold hover:text-orange-200 transition-colors">
            BettingBaits
          </Link>

          <div className="sm:hidden text-white text-2xl cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-orange-100 font-medium">BB Coins: {totalBB}</span>

            {isLoggedIn && user ? (
              <>
                <Link href="/wallet" className="text-white hover:bg-orange-700/50 px-3 py-2 rounded-md flex items-center">
                  <FaWallet className="mr-1" /> Wallet
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="text-white flex items-center px-3 py-2 hover:bg-orange-700/50 rounded-md"
                  >
                    <FaUser className="mr-1" /> {user.username}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-100"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  )}
                </div>
                {user.username === 'admin' && <AdminLinks />}
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:bg-orange-700/50 px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link href="/signup" className="bg-white text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-md font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden mt-2 space-y-2 pb-4">
            <span className="block text-orange-100 font-medium">BB Coins: {totalBB}</span>
            {isLoggedIn && user ? (
              <>
                <Link href="/wallet" className="block text-white hover:bg-orange-700/50 px-3 py-2 rounded-md">
                  <FaWallet className="inline mr-1" /> Wallet
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full text-left text-white flex items-center px-3 py-2 hover:bg-orange-700/50 rounded-md"
                  >
                    <FaUser className="mr-1" /> {user.username}
                  </button>
                  {dropdownOpen && (
                    <div className="ml-3 mt-1 w-32 bg-white rounded-md shadow-lg z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-100"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  )}
                </div>
                {user.username === 'admin' && <AdminLinks />}
              </>
            ) : (
              <>
                <Link href="/login" className="block text-white hover:bg-orange-700/50 px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link href="/signup" className="block bg-white text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-md font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;