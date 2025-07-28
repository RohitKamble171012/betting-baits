//distribute/page.tsx
"use client";
import { useState } from 'react';
import Navbar from '../../components/Navbar';

export default function DistributePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDistribute = async () => {
    setLoading(true);
    setSuccess(false);
    setMessage('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/results/distribute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      setMessage(data.message || data.error);
      if (response.ok) { // Check HTTP status code instead of message text
  setSuccess(true);
}
    } catch (error) {
      setMessage('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar isLoggedIn={true} user={{ username: 'admin' }} totalBB={0} />

      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute w-96 h-96 bg-orange-800 opacity-30 blur-3xl rounded-full top-20 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-orange-600 opacity-20 blur-3xl rounded-full bottom-10 right-10 animate-ping"></div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto mt-28 p-8 bg-zinc-900 rounded-2xl shadow-lg border border-orange-700 relative z-10">
        <h1 className="text-3xl font-extrabold text-orange-500 mb-6 text-center tracking-wide">
          Reward Distribution Panel
        </h1>

        <button 
          onClick={handleDistribute}
          disabled={loading}
          className={`w-full py-3 px-6 text-lg font-semibold rounded-md transition-all duration-300 ease-in-out 
            ${loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700 active:scale-95 shadow-lg hover:shadow-orange-500/30'}`}
        >
          {loading ? 'Processing...' : '💸 Start Distribution'}
        </button>

        {message && (
          <div className={`mt-6 p-4 text-sm rounded-lg border-l-4 transition-all duration-500 
            ${message.toLowerCase().includes('success')
              ? 'bg-green-900 border-green-500 text-green-300'
              : 'bg-red-900 border-red-500 text-red-300'}`}>
            {message}
          </div>
        )}

        {/* Floating Money Emoji Rain when Success */}
        {success && (
          <div className="money-rain absolute inset-0 pointer-events-none z-20" />
        )}
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        .money-rain::before {
          content: '💸 💵 🪙 💰 💸 💵 🪙 💰 💸 💵 🪙 💰';
          position: absolute;
          width: 100%;
          height: 100%;
          font-size: 2rem;
          animation: rain 2.5s linear infinite;
          white-space: nowrap;
        }

        @keyframes rain {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
