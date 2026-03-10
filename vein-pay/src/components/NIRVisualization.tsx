import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Scan } from 'lucide-react';

export default function NIRVisualization() {
  const [showNIR, setShowNIR] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Vein Pattern Visualization</h3>
        <button
          onClick={() => setShowNIR(!showNIR)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showNIR ? <Eye className="w-4 h-4" /> : <Scan className="w-4 h-4" />}
          {showNIR ? 'Show Original' : 'Show NIR Pattern'}
        </button>
      </div>

      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <motion.div
          initial={false}
          animate={{ opacity: showNIR ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white/80">
              <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                <path d="M 30 50 Q 40 30, 50 50 T 70 50" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M 35 60 Q 45 45, 55 60 T 75 60" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M 28 40 L 32 45 L 28 50" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M 72 40 L 68 45 L 72 50" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <p className="text-sm">Original Palm Image</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: showNIR ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full h-full bg-gradient-to-br from-red-950 via-black to-red-950 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <motion.path
                d="M 100 150 Q 120 120, 150 150 Q 180 180, 200 150 Q 220 120, 250 150 Q 280 180, 300 150"
                stroke="#ff3366"
                strokeWidth="2"
                fill="none"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              />
              <motion.path
                d="M 110 170 Q 140 145, 170 170 Q 200 195, 230 170 Q 260 145, 290 170"
                stroke="#ff4477"
                strokeWidth="2"
                fill="none"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <motion.path
                d="M 120 130 Q 150 110, 180 130 Q 210 150, 240 130 Q 270 110, 300 130"
                stroke="#ff5588"
                strokeWidth="2"
                fill="none"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
              />
              <motion.path
                d="M 130 190 Q 160 165, 190 190 Q 220 215, 250 190 Q 280 165, 310 190"
                stroke="#ff6699"
                strokeWidth="1.5"
                fill="none"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
              />
              <motion.circle
                cx="150"
                cy="150"
                r="3"
                fill="#ff3366"
                filter="url(#glow)"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.circle
                cx="250"
                cy="150"
                r="3"
                fill="#ff3366"
                filter="url(#glow)"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              />
            </svg>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="bg-red-950/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-800">
                <p className="text-xs text-red-200">Near-Infrared Vein Pattern</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-gray-500 mb-1">Resolution</p>
          <p className="font-semibold text-gray-800">1920x1080</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-gray-500 mb-1">NIR Wavelength</p>
          <p className="font-semibold text-gray-800">850nm</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-gray-500 mb-1">Liveness</p>
          <p className="font-semibold text-green-600">Confirmed</p>
        </div>
      </div>
    </div>
  );
}
