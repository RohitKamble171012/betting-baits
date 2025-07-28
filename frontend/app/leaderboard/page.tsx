//leaderboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCrown, FaCoins, FaSyncAlt } from "react-icons/fa";
import { API_URL } from '../../lib/config';
import { getValidToken } from '../../lib/auth';

type LeaderboardEntry = {
  username: string;
  department: string;
  bb_total: number | undefined;
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const token = getValidToken();
      const res = await fetch(`${API_URL}/api/leaderboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center py-8 text-amber-300">Loading leaderboard...</div>;
  if (error) return <div className="text-center py-8 text-red-400">Error: {error}</div>;

  return (
    <div className="min-h-[70vh] bg-gray-900 text-amber-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Top Traders
          </h1>
          <button
            onClick={fetchLeaderboard}
            className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 px-4 py-2 rounded-lg transition-colors"
          >
            <FaSyncAlt className="text-amber-400" />
            <span className="text-amber-100">Refresh</span>
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-700/50 p-4 text-sm font-medium">
            <div className="col-span-1">Rank</div>
            <div className="col-span-6">User</div>
            <div className="col-span-3">Department</div>
            <div className="col-span-2 text-right">BB Points</div>
          </div>

          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.username}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-12 items-center p-4 border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
            >
              <div className="col-span-1">
                {index === 0 ? (
                  <FaCrown className="text-2xl text-amber-400" />
                ) : (
                  <span className={`text-sm ${index < 3 ? 'text-amber-300' : 'text-gray-400'}`}>
                    #{index + 1}
                  </span>
                )}
              </div>
              <div className="col-span-6 font-medium text-amber-100">{entry.username}</div>
              <div className="col-span-3 text-sm text-gray-300">{entry.department}</div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <FaCoins className="text-amber-400" />
                <span className="font-mono">
                  {(entry.bb_total ?? 0).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
