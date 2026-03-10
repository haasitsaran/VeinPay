import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Copy, CheckCircle2 } from 'lucide-react';

interface PaymentDashboardProps {
  onClose: () => void;
}

export default function PaymentDashboard({ onClose }: PaymentDashboardProps) {
  const [token] = useState(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });
  const [timeLeft, setTimeLeft] = useState(120);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / 120) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Secure Payment Token</h2>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <p className="text-blue-100 text-sm">One-Time Transaction Token (OTT)</p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-600">Transaction Token</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-2xl font-bold text-gray-800 tracking-wider break-all bg-white p-4 rounded border-2 border-gray-200">
              {token}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Token Validity</span>
              <span className="text-sm font-semibold text-gray-800">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  progress > 50 ? 'bg-green-500' :
                  progress > 25 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 mb-1">Encryption</p>
              <p className="text-sm font-semibold text-blue-900">AES-256</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-green-600 mb-1">Status</p>
              <p className="text-sm font-semibold text-green-900">Active</p>
            </div>
            <div className="bg-cyan-50 rounded-lg p-4">
              <p className="text-xs text-cyan-600 mb-1">Key Derivation</p>
              <p className="text-sm font-semibold text-cyan-900">Biometric Hash</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Session ID</p>
              <p className="text-sm font-semibold text-slate-900 font-mono">
                {token.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Security Notice:</span> This token expires in {minutes}m {seconds}s and can only be used once. Never share this token with anyone.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel Transaction
            </button>
            <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
