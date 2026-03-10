import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Trash2, DollarSign, LogOut, BarChart3, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CartItem } from '../types';
import PaymentModal from '../components/PaymentModal';
import ThemeToggle from '../components/ThemeToggle';

const catalogItems = [
  { id: '1', name: 'Coffee', price: 5.50 },
  { id: '2', name: 'Sandwich', price: 12.00 },
  { id: '3', name: 'Juice', price: 4.50 },
  { id: '4', name: 'Salad', price: 10.00 },
  { id: '5', name: 'Dessert', price: 8.00 },
  { id: '6', name: 'Tea', price: 4.00 },
];

export default function BusinessDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'pos' | 'reports'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const filteredItems = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: typeof catalogItems[0]) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, quantity } : c));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VeinPay</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.businessName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle size="sm" />
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"
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
          {(['pos', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'pos' ? <ShoppingCart className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              {tab === 'pos' ? 'POS Billing' : 'Reports'}
            </button>
          ))}
        </div>

        {activeTab === 'pos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <motion.div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search Items</h3>
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </motion.div>

              <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence mode="wait">
                  {filteredItems.map((item) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -4 }}
                      onClick={() => addToCart(item)}
                      className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 hover:shadow-lg transition-all text-left border border-gray-100 dark:border-slate-800"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">Add to cart</span>
                        <Plus className="w-4 h-4 text-blue-600" />
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            <motion.div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 h-fit sticky top-6 border border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart
              </h3>

              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Cart is empty</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{total.toFixed(2)}</span>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Total</p>
                  <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cart.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 dark:text-gray-300 font-medium">Today's Revenue</h3>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₹1,250.00</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">18 transactions</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 dark:text-gray-300 font-medium">This Month</h3>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₹28,450.00</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">412 transactions</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 dark:text-gray-300 font-medium">Average Order</h3>
                <Calendar className="w-5 h-5 text-cyan-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₹69.00</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month avg</p>
            </motion.div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal onClose={() => setShowPaymentModal(false)} amount={total} />
        )}
      </AnimatePresence>
    </div>
  );
}
