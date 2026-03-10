import { motion } from 'framer-motion';
import { Hand, Activity } from 'lucide-react';

interface ScannerInterfaceProps {
  status: 'idle' | 'scanning' | 'verifying' | 'authenticated' | 'rejected';
}

export default function ScannerInterface({ status }: ScannerInterfaceProps) {
  const isScanning = status === 'scanning' || status === 'verifying';

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative aspect-square flex items-center justify-center">
        {isScanning && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-500/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-400/40"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </>
        )}

        <motion.div
          className={`relative w-64 h-64 rounded-full border-4 flex items-center justify-center ${
            status === 'authenticated' ? 'border-green-500 bg-green-50' :
            status === 'rejected' ? 'border-red-500 bg-red-50' :
            isScanning ? 'border-blue-500 bg-blue-50' :
            'border-gray-300 bg-gray-50'
          }`}
          animate={status === 'authenticated' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            {status === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <Hand className="w-16 h-16 text-gray-400" />
                <p className="text-sm text-gray-600 font-medium">Place palm here</p>
              </motion.div>
            )}

            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Activity className="w-16 h-16 text-blue-500" />
                </motion.div>
                <p className="text-sm text-blue-600 font-medium">
                  {status === 'scanning' ? 'Analyzing blood flow...' : 'Verifying pattern...'}
                </p>
              </motion.div>
            )}

            {status === 'authenticated' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-16 h-16" viewBox="0 0 50 50">
                    <motion.path
                      d="M 10 25 L 20 35 L 40 15"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                </motion.div>
                <p className="text-sm text-green-600 font-medium">Authenticated</p>
              </motion.div>
            )}

            {status === 'rejected' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <svg className="w-16 h-16" viewBox="0 0 50 50">
                  <motion.path
                    d="M 15 15 L 35 35 M 35 15 L 15 35"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <p className="text-sm text-red-600 font-medium">Authentication Failed</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {isScanning && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: status === 'scanning' ? 3 : 2,
                ease: "easeInOut"
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
