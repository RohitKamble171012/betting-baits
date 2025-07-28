//hero.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCoins, FaTrophy, FaChartLine } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { API_URL } from "../../lib/config";

type LeaderboardEntry = {
  username: string;
  department: string;
  bb_total: number;
};

const Hero = () => {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/leaderboard`);
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setLeaderboard(data.slice(0, 3)); // Top 3
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <section className="pt-12 pb-6 px-4 md:px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
            BettingBaits
          </h1>
          <p className="text-base md:text-lg text-amber-100">
            Where predictions meet rewards! Bet on placement outcomes and win big.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-6 md:mb-10"
        >
          {/* Open Bet */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 md:p-5 rounded-xl shadow-md border-2 border-amber-400 bg-gray-800 md:h-[300px] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center mb-2">
                <FaCoins className="text-amber-400 mr-2 text-lg" />
                <h2 className="text-base md:text-lg font-bold text-amber-400">
                  Open Betting
                </h2>
              </div>
              <p className="text-xs md:text-sm text-gray-300 mb-2">
                Bet on any student across all departments
              </p>
              <div className="flex items-center text-amber-300 mb-3">
                <FaChartLine className="mr-2 text-sm" />
                <span className="text-xs md:text-sm">Pool: 5,000 BB</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/playground/open")}
              className="w-full py-2 rounded-md text-xs md:text-sm bg-amber-500 text-black hover:bg-amber-400 transition-colors"
            >
              Start Betting
            </button>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 md:p-5 rounded-xl shadow-md border-2  bg-gray-800 md:h-[300px] flex flex-col hover: border-purple-400"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FaTrophy className="text-purple-400 mr-2 text-lg" />
                <h2 className="text-base md:text-lg font-bold text-purple-400">
                  Top Players
                </h2>
              </div>
              <span className="text-xs text-purple-300">All Time</span>
            </div>

            {loading ? (
              <div className="space-y-2 flex-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse p-2 bg-gray-700/30 rounded-md"
                  >
                    <div className="h-4 bg-gray-600/50 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
                {error}
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.username}
                    className="flex items-center justify-between p-2 bg-gray-700/30 rounded-md"
                  >
                    <div className="flex items-center">
                      <span
                        className={`text-xs font-medium mr-2 ${
                          index === 0
                            ? "text-amber-400"
                            : index === 1
                            ? "text-gray-300"
                            : "text-amber-100"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-100 truncate">
                          {entry.username}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400">
                          {entry.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaCoins className="text-amber-400 mr-1 text-xs" />
                      <span className="text-xs md:text-sm font-medium text-amber-300">
                        {entry.bb_total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/leaderboard")}
              className="w-full mt-3 py-2 pb-2 rounded-md text-xs md:text-sm bg-purple-500 text-black hover:bg-purple-400 transition-colors"
            >
              View Full Leaderboard
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-800/50 p-3 md:p-4 rounded-lg border border-gray-700"
        >
          <h3 className="text-center text-sm md:text-base font-medium text-amber-300 mb-2">
            Current Platform Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="p-1">
              <p className="text-lg md:text-xl font-bold text-amber-400">1.2K</p>
              <p className="text-[10px] md:text-xs text-gray-400">Active Bets</p>
            </div>
            <div className="p-1">
              <p className="text-lg md:text-xl font-bold text-purple-400">5K</p>
              <p className="text-[10px] md:text-xs text-gray-400">BB in Play</p>
            </div>
            <div className="p-1">
              <p className="text-lg md:text-xl font-bold text-green-400">42</p>
              <p className="text-[10px] md:text-xs text-gray-400">Placements Today</p>
            </div>
            <div className="p-1">
              <p className="text-lg md:text-xl font-bold text-blue-400">320</p>
              <p className="text-[10px] md:text-xs text-gray-400">Active Predictors</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
