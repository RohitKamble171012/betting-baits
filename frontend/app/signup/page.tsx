//signup page
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserPlus, FaUser, FaLock, FaCheck, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

const departments = [
  'CSE',
  'CSE (DS)',
  'CSE (AIML)',
  'ENTC',
  'CHEMICAL',
  'MECHANICAL',
  'CIVIL',
  'ARCHITECTURE'
];

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.replace('/');
    }
  }, [router]);
  const validatePassword = (pass: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    return pass.length >= minLength && hasUpper && hasLower && hasNumber;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      if (!validatePassword(password)) {
        setError('Password must be 8+ chars with uppercase, lowercase, and number');
        return;
      }
  
      if (password !== confirm) {
        setError('Passwords do not match');
        return;
      }
  
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          department,
          password
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
  
      localStorage.setItem('authToken', data.token);
      router.push('/');
    } catch (err) {  // Removed incorrect comma before catch
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  // Properly closed function declaration

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
          BettingBaits
        </h1>
        <p className="text-orange-200">Start your betting journey with 150 BB free!</p>
      </div>

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center mb-6">
            <FaUserPlus className="text-orange-400 mr-3 text-2xl" />
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4">
              <label className="block text-orange-200 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="mb-4 relative">
              <label className="block text-orange-200 mb-2">Department</label>
              <div
                className="relative cursor-pointer"
                onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              >
                <input
                  type="text"
                  readOnly
                  required
                  value={department}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                  placeholder="Select your department"
                />
                <FaChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform ${showDeptDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showDeptDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {departments.map((dept) => (
                    <div
                      key={dept}
                      className={`px-4 py-2 hover:bg-gray-600 cursor-pointer ${department === dept ? 'bg-orange-500/20' : ''}`}
                      onClick={() => {
                        setDepartment(dept);
                        setShowDeptDropdown(false);
                      }}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-orange-200 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Create a password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-orange-200 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCheck className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center ${isLoading
                ? 'bg-orange-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                } transition-all`}
            >
              {isLoading ? 'Creating account...' : <>Sign Up <FaArrowRight className="ml-2" /></>}
            </button>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-700/50 border-t border-gray-700 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Log in instead
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);
}