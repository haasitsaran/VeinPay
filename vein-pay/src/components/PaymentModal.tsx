import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Wifi, Smartphone } from 'lucide-react';
import HardwareScannerMode from './HardwareScannerMode';
import CameraScannerMode from './CameraScannerMode';

interface PaymentModalProps {
  onClose: () => void;
  amount: number;
}

export default function PaymentModal({ onClose, amount }: PaymentModalProps) {
  const [mode, setMode] = useState<'select' | 'hardware' | 'camera'>('select');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold">Payment Terminal</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 text-white mb-6">
                <p className="text-sm opacity-90">Total Amount</p>
                <p className="text-3xl font-bold">${amount.toFixed(2)}</p>
              </div>

              <p className="text-gray-600 text-center mb-6">
                Choose your payment method
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('hardware')}
                className="w-full border-2 border-blue-600 rounded-lg p-6 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">External Hardware Scanner</h3>
                    <p className="text-sm text-gray-600">Connect via USB/Serial</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('camera')}
                className="w-full border-2 border-cyan-600 rounded-lg p-6 hover:bg-cyan-50 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Device Camera</h3>
                    <p className="text-sm text-gray-600">Mobile/Web Camera Scanner</p>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}

          {mode === 'hardware' && (
            <HardwareScannerMode
              amount={amount}
              onBack={() => setMode('select')}
              onClose={onClose}
            />
          )}

          {mode === 'camera' && (
            <CameraScannerMode
              amount={amount}
              onBack={() => setMode('select')}
              onClose={onClose}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
