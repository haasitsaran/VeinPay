import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingDown, History, User, Shield, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import SecuritySidebar from '../components/SecuritySidebar';

const expenseData = [
  { month: 'Jan', amount: 400 },
  { month: 'Feb', amount: 300 },
  { month: 'Mar', amount: 500 },
  { month: 'Apr', amount: 450 },
  { month: 'May', amount: 600 },
  { month: 'Jun', amount: 550 },
];

const transactions = [
  { id: 1, desc: 'Coffee Shop', amount: 5.50, time: '2 hours ago' },
  { id: 2, desc: 'Grocery Store', amount: 45.20, time: '4 hours ago' },
  { id: 3, desc: 'Gas Station', amount: 60.00, time: '1 day ago' },
  { id: 4, desc: 'Restaurant', amount: 32.80, time: '2 days ago' },
  { id: 5, desc: 'Movie Theater', amount: 15.00, time: '3 days ago' },
];

export default function PersonalDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'profile'>('overview');
  const [securityOpen, setSecurityOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">VeinPay</h1>
                <p className="text-xs text-gray-500">Personal Account</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSecurityOpen(true)}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Shield className="w-5 h-5" />
                Security
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {(['overview', 'history', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 font-medium border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Account Balance</h3>
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">${user?.balance || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Available funds</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Monthly Expenses</h3>
                  <TrendingDown className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">$2,900</p>
                <p className="text-xs text-gray-500 mt-1">Total this month</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Transactions</h3>
                  <History className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">127</p>
                <p className="text-xs text-gray-500 mt-1">Total this year</p>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expense Tracker</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    formatter={(value) => `$${value}`}
                  />
                  <Bar dataKey="amount" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="divide-y divide-gray-200">
              {transactions.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{tx.desc}</p>
                    <p className="text-sm text-gray-500">{tx.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">-${tx.amount.toFixed(2)}</p>
                    <p className="text-xs text-green-600">Via Palm Scan</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <p className="text-lg text-gray-900 font-medium">{user?.username}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Account Type</label>
                  <p className="text-lg text-gray-900 font-medium">Personal User</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Biometric Key Status</p>
                      <p className="text-sm text-green-700">AES-256 Active</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700">
                      Your biometric data is encrypted using military-grade AES-256 encryption. Only you can authorize transactions.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Digital Signature</p>
                        <p className="text-xs text-gray-500">Linked to your palm template</p>
                      </div>
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-2">
                      <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                        VP-DSIG-9F3A-7C2E-41B8-AB29
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <SecuritySidebar isOpen={securityOpen} onClose={() => setSecurityOpen(false)} />
    </div>
  );
}
