import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity } from 'lucide-react';
import NIRVisualization from './NIRVisualization';

interface HardwareScannerModeProps {
  amount: number;
  onBack: () => void;
  onClose: () => void;
}

export default function HardwareScannerMode({ amount, onBack, onClose }: HardwareScannerModeProps) {
  const [stage, setStage] = useState<'waiting' | 'verifying' | 'complete'>('waiting');
  const [token] = useState(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });

  useEffect(() => {
    if (stage === 'verifying') {
      const timer = setTimeout(() => {
        setStage('complete');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {stage === 'waiting' && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <Activity className="w-10 h-10 text-blue-600" />
            </motion.div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Waiting for Scanner
          </h3>
          <p className="text-gray-600 mb-4">
            Attempting to connect via USB/Serial...
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <p>Scanning for:</p>
            <p className="font-mono mt-1">COM3 | /dev/ttyUSB0</p>
          </div>
          <button
            onClick={() => setStage('verifying')}
            className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            Start Scan
          </button>
        </div>
      )}

      {stage === 'verifying' && (
        <div className="space-y-8 py-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center">
                <Activity className="w-10 h-10 text-cyan-600" />
              </div>
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verifying Blood Flow
            </h3>
            <p className="text-gray-600 mb-4">
              Analyzing PPG patterns and liveness...
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold text-gray-900">75%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  initial={{ width: '0%' }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          </div>

          {/* NIR visualization demo for hardware scanner */}
          <NIRVisualization />
        </div>
      )}

      {stage === 'complete' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </motion.div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Authorized
          </h3>
          <p className="text-gray-600 mb-6">
            Your biometric payment of ${amount.toFixed(2)} is complete.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-xs text-green-600 mb-2">Token Generated</p>
            <p className="font-mono font-bold text-green-900">{token}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
          >
            Complete Transaction
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
