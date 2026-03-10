import { motion } from 'framer-motion';
import { Shield, Lock, Key, Fingerprint, Eye, CheckCircle } from 'lucide-react';

interface SecuritySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecuritySidebar({ isOpen, onClose }: SecuritySidebarProps) {
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto lg:relative lg:translate-x-0"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <h3 className="text-lg font-bold">Security Info</h3>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-blue-100">Your data is protected</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">System Active</h4>
                <p className="text-sm text-green-700">All security protocols operational</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">AES-256 Encryption</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Military-grade encryption secures all biometric data using 256-bit Advanced Encryption Standard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Biometric Key Derivation</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Unique encryption keys are derived from your vein pattern, never stored or transmitted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Liveness Detection</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  PPG blood flow analysis ensures only living tissue is authenticated, preventing spoofing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">NIR Imaging</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Near-infrared technology captures subsurface vein patterns invisible to the naked eye.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Security Layers</h4>
            <div className="space-y-2">
              {[
                'Biometric Authentication',
                'Liveness Verification',
                'Pattern Encryption',
                'One-Time Token Generation',
                'Session Time Limits'
              ].map((layer, index) => (
                <motion.div
                  key={layer}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {layer}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Privacy Guarantee</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your biometric data is processed locally and never leaves your device in raw form.
              Only encrypted hashes are used for authentication, ensuring complete privacy.
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">256-bit</p>
                <p className="text-xs text-gray-600 mt-1">Encryption</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">850nm</p>
                <p className="text-xs text-gray-600 mt-1">NIR Light</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-xs text-gray-600 mt-1">Accuracy</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">&lt;2s</p>
                <p className="text-xs text-gray-600 mt-1">Auth Time</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
