//open betting page
"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCoins, FaUniversity, FaGraduationCap, FaSearch, FaLock, FaTicketAlt, FaExclamationTriangle, FaTerminal } from "react-icons/fa";
import { API_URL } from '../../../lib/config';
import { getValidToken } from '../../../lib/auth';

type Student = {
  id: string;
  name: string;
  department: string;
  marks: number;
};

type Bet = {
  studentId: string;
  amount: number;
  studentName: string;
  status: 'pending' | 'success' | 'failed';
};

const MatrixEffect: React.FC<{ characters?: string; fontSize?: string }> = ({ 
  characters = "01", 
  fontSize = "sm" 
}) => {
  const [matrixChars, setMatrixChars] = useState<string[][]>([]);
  
  useEffect(() => {
    // Generate matrix characters only on client side to avoid hydration mismatch
    const columns = 20;
    const rows = 20;
    const newMatrixChars = [];
    
    for (let i = 0; i < columns; i++) {
      const column = [];
      for (let j = 0; j < rows; j++) {
        column.push(characters.charAt(Math.floor(Math.random() * characters.length)));
      }
      newMatrixChars.push(column);
    }
    
    setMatrixChars(newMatrixChars);
  }, [characters]);

  // Return empty div during SSR to prevent hydration mismatch
  if (matrixChars.length === 0) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"></div>;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {matrixChars.map((column, i) => (
        <div
          key={i}
          className={`absolute top-0 text-orange-500 opacity-20 text-${fontSize} font-mono animate-matrix-column`}
          style={{ left: `${i * 5}%`, animationDelay: `${i * 0.5}s` }}
        >
          {column.map((char, j) => (
            <span key={j} className="opacity-50">
              {char}
              <br />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const PasswordGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [password, setPassword] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "100001") {
      onUnlock();
    } else {
      setAccessDenied(true);
      setTimeout(() => setAccessDenied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <MatrixEffect />
      <div className="relative z-10 bg-black/90 p-5 sm:p-8 rounded-lg border border-orange-500/50 shadow-xl w-full max-w-md mx-4">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <FaTerminal className="text-orange-500 text-3xl sm:text-4xl mb-3 sm:mb-4 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-mono text-orange-500 mb-2 text-center">SECURE ACCESS PORTAL</h1>
            <p className="text-orange-500/70 text-sm text-center">CLASSIFIED: BETTING INTERFACE</p>
          </div>

          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/70 border border-orange-500/30 rounded-lg font-mono text-orange-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              placeholder="ENTER ACCESS CODE"
            />
            <div className="absolute inset-0 border border-orange-500/50 rounded-lg pointer-events-none animate-pulse-slow group-focus-within:hidden" />
          </div>

          {accessDenied && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm font-mono flex items-center"
            >
              <FaExclamationTriangle className="mr-2" /> ACCESS DENIED - INVALID CREDENTIALS
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/50 rounded-lg font-mono text-orange-500 transition-all flex items-center justify-center"
          >
            INITIALIZE SYSTEM
          </button>

          <div className="text-center mt-4">
            <p className="text-orange-500/50 text-xs font-mono">
              Hint: {String.fromCharCode(60)}Check your registered Gmail{String.fromCharCode(62)}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const OpenBettingPage = () => {
  const [passwordCorrect, setPasswordCorrect] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [availableBB, setAvailableBB] = useState(0);
  const [placedBets, setPlacedBets] = useState<Bet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');

  // Set API URL only on client side to prevent hydration mismatch
  useEffect(() => {
    setApiUrl(API_URL || '');
  }, []);

  useEffect(() => {
    if (!passwordCorrect) return;
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError("Authentication required. Please login again.");
          setLoading(false);
          return;
        }

        const [studentsRes, userRes] = await Promise.all([
          fetch(`${apiUrl}/api/students/all`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!studentsRes.ok) throw new Error('Failed to fetch students');
        if (!userRes.ok) throw new Error('Failed to fetch user data');

        const studentsData = await studentsRes.json();
        const userData = await userRes.json();

        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setAvailableBB(userData.bb_total - (userData.bb_locked || 0));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (apiUrl) {
      fetchData();
    }
  }, [apiUrl, passwordCorrect]);

  const handleBet = async (amount: number) => {
    if (!selectedStudent) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const res = await fetch(`${apiUrl}/api/bet/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: betAmount + amount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Bet failed');

      setAvailableBB(data.balance.available);
      setPlacedBets(prev => [...prev, {
        studentId: selectedStudent.id,
        amount: betAmount + amount,
        studentName: selectedStudent.name,
        status: 'pending'
      }]);
      
      setBetAmount(0);
      setSelectedStudent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bet failed');
    }
  };

  if (!passwordCorrect) return <PasswordGate onUnlock={() => setPasswordCorrect(true)} />;

  if (loading)   return (
    <div className="min-h-screen bg-black text-orange-500 flex items-center justify-center relative">
      <MatrixEffect characters="01" fontSize="base" />
      <div className="text-center p-6 relative z-10 w-full max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <div className="text-xl font-mono text-orange-500">
          DECRYPTING DATA STREAMS...
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-orange-500 p-3 md:p-8 relative overflow-hidden">
      <MatrixEffect />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-mono bg-black/50 px-3 py-2 rounded-lg border border-orange-500/30 truncate w-full sm:w-auto text-center sm:text-left">
              BETTINGBAITS_BET_TERMINAL
              <span className="hidden sm:inline"> v2.1.5</span>
            </h1>
            <div className="flex items-center bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/30 whitespace-nowrap">
              <FaCoins className="mr-2 text-orange-400" />
              <span className="font-mono">{availableBB} BB_AVAILABLE</span>
            </div>
          </div>

          <div className="relative mb-8 group">
            <input
              type="text"
              placeholder="SEARCH TARGETS..."
              className="w-full pl-10 pr-4 py-2 bg-black/30 border border-orange-500/30 rounded-lg font-mono text-orange-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-orange-500/50" />
            <div className="absolute inset-0 border border-orange-500/50 rounded-lg pointer-events-none animate-pulse-slow group-focus-within:hidden" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols:1 gap-4">
          {students.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            student.department.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(student => (
            <motion.div
              key={student.id}
              whileHover={{ scale: 1.02 }}
              className="bg-black/30 p-4 rounded-lg border border-orange-500/30 cursor-pointer group"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-orange-400 font-mono">{student.name}</h3>
                  <div className="flex items-center mt-1 text-sm text-orange-500/80">
                    <FaUniversity className="mr-2 text-amber-400" />
                    <span>{student.department}</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-orange-500/80">
                    <FaGraduationCap className="mr-2 text-orange-400" />
                    <span>{student.marks}%_INTEL</span>
                  </div>
                </div>
                <div className="flex items-center bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/30">
                  <FaTicketAlt className="mr-2 text-sm" />
                  <span className="text-sm font-mono">
                    {placedBets.filter(b => b.studentId === student.id).length}_BETS
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 bg-black/90 p-4 sm:p-6 rounded-t-2xl border-t border-orange-500/30 shadow-xl z-50"
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                 <h2 className="text-lg sm:text-xl font-bold text-orange-400 font-mono truncate pr-2">
  BET_PROTOCOL &gt;&gt; {selectedStudent.name}
</h2>


                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setBetAmount(0);
                      setError(null);
                    }}
                    className="text-orange-500/50 hover:text-orange-400 text-xl p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  {[10, 30, 50].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(prev => prev + amount)}
                      className={`p-3 rounded-lg font-mono border ${
                        availableBB >= (betAmount + amount)
                          ? 'border-orange-500/30 hover:border-orange-500 bg-orange-500/10'
                          : 'border-red-500/30 bg-red-500/10 cursor-not-allowed'
                      }`}
                      disabled={availableBB < (betAmount + amount)}
                    >
                      +{amount}_BB
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center text-orange-500/80">
                    <FaLock className="mr-2" />
                    <span className="font-mono">TOTAL_STAKE:</span>
                  </div>
                  <div className="flex items-center text-orange-400">
                    <FaCoins className="mr-2" />
                    <span className="font-mono text-xl">{betAmount}_BB</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBet(0)}
                  disabled={betAmount === 0 || availableBB < betAmount}
                  className="w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg font-mono text-orange-500 transition-all"
                >
                  EXECUTE_BET ({betAmount}_BB)
                </button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-mono"
                  >
                    <FaExclamationTriangle className="mr-2 inline" /> {error}
                  </motion.div>
                )}

                <div className="mt-6">
                  <h3 className="text-md font-semibold text-orange-400 mb-2 font-mono">
                    ACTIVE_BETS >> {selectedStudent.name}
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {placedBets
                      .filter(b => b.studentId === selectedStudent.id)
                      .map((bet, index) => (
                        <div 
                          key={index}
                          className="flex justify-between items-center text-sm bg-orange-500/5 px-3 py-2 rounded-lg border border-orange-500/10"
                        >
                          <span className="font-mono">{bet.amount}_BB</span>
                          <span className={`font-mono ${
                            bet.status === 'pending' ? 'text-amber-400' :
                            bet.status === 'success' ? 'text-orange-400' : 'text-red-400'
                          }`}>
                            {bet.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-scanline" />
      </div>
    </div>
  );
};

export default OpenBettingPage;
