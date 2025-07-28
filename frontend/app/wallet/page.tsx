// app/wallet/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { FaCoins, FaLock, FaWallet, FaHistory, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type Bet = {
  _id: string;
  student: {
    _id: string;
    name: string;
  };
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
};

const WalletPage = () => {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [locked, setLocked] = useState(0);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const [walletRes, betsRes] = await Promise.all([
          fetch(`${API_URL}/api/bet/wallet`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/bet/my-bets`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!walletRes.ok) throw new Error('Failed to fetch wallet');
        const walletData = await walletRes.json();

        if (!betsRes.ok) throw new Error('Failed to fetch bets');
        const betsData = await betsRes.json();

        setTotal(walletData.total);
        setLocked(walletData.locked);
        setBets(betsData.bets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-400';
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse text-2xl text-amber-400 flex items-center gap-2">
        <FaCoins className="animate-bounce" /> Loading Wallet...
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-red-400 text-center p-4 max-w-md">
        <FaWallet className="text-3xl mb-2 mx-auto" />
        <p className="text-xl mb-4">Wallet Error</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Wallet Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <FaWallet className="text-4xl text-amber-400" />
            <h1 className="text-3xl font-bold">BB Wallet</h1>
          </div>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/70 p-6 rounded-xl border border-amber-800/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaCoins className="text-2xl text-amber-400" />
              <h3 className="text-lg font-semibold">Total Balance</h3>
            </div>
            <p className="text-3xl font-bold">{total} BB</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/70 p-6 rounded-xl border border-amber-800/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaLock className="text-2xl text-amber-400" />
              <h3 className="text-lg font-semibold">Locked Balance</h3>
            </div>
            <p className="text-3xl font-bold">{locked} BB</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/70 p-6 rounded-xl border border-amber-800/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaChartLine className="text-2xl text-amber-400" />
              <h3 className="text-lg font-semibold">Available</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {total - locked} BB
            </p>
          </motion.div>
        </div>

        {/* Bet History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/50 rounded-xl border border-amber-800/30"
        >
          <div className="p-4 border-b border-amber-800/30">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaHistory className="text-amber-400" /> Bet History
            </h2>
          </div>

          <div className="max-h-[500px] overflow-y-auto p-4">
            {bets.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                No bets placed yet
              </div>
            ) : (
              bets.map((bet) => (
                <motion.div
                  key={bet._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 mb-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-amber-300">
                        {bet.student ?.name || 'Unknown Student'}
                      </h3>
                     
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{bet.amount} BB</p>
                      <p className={`text-sm ${getStatusColor(bet.status)}`}>
                        {bet.status}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletPage;