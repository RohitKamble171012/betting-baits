//login page
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignInAlt, FaUser, FaLock, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, send to home
  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      router.replace('/');
    }
  }, [router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Authentication failed');

      // Store token and redirect
      localStorage.setItem('authToken', data.token);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
            BettingBaits
          </h1>
          <p className="text-orange-200">Place your bets and win big</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-6">
              <FaSignInAlt className="text-orange-400 mr-3 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Log In</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-orange-200 mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-orange-200 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center ${isLoading
                    ? 'bg-orange-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                  } transition-all`}
              >
                {isLoading ? (
                  'Logging in...'
                ) : (
                  <>
                    Log In <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="px-6 py-4 bg-gray-700/50 border-t border-gray-700 text-center">
            <p className="text-gray-400">
              New here?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
//1