'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { GymConfig } from '@/types';

interface AccessPassModalProps {
  config: GymConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const AccessPassModal: React.FC<AccessPassModalProps> = ({
  config,
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`w-full max-h-[92%] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border ${
              config.isDarkMode
                ? 'bg-slate-900 border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {config.logoMonogram || config.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">{config.name}</h3>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Active Access Pass
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-700/40 transition text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pass Card */}
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white border border-white/10 shadow-lg relative overflow-hidden">
              <div
                className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-30"
                style={{ backgroundColor: config.primaryColor }}
              />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] tracking-wider uppercase text-slate-400 font-mono">
                    Member Name
                  </span>
                  <h4 className="text-base font-bold">Alex Rivera</h4>
                  <span className="text-xs text-slate-400">ID: #APX-98241</span>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-950 uppercase tracking-wide"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  VIP All-Access
                </span>
              </div>

              {/* Barcode / QR Simulation with Animated Scanning Laser */}
              <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center relative shadow-inner text-slate-900">
                {/* Laser scan line */}
                <motion.div
                  className="absolute left-4 right-4 h-0.5 shadow-[0_0_8px_#ef4444]"
                  style={{ backgroundColor: config.primaryColor }}
                  animate={{ top: ['15%', '85%', '15%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Simulated Barcode Lines */}
                <div className="w-full flex items-center justify-center gap-[3px] h-20 px-2 py-1">
                  {[2, 4, 1, 3, 5, 2, 1, 4, 2, 6, 1, 3, 2, 4, 5, 2, 1, 3, 4, 2, 1, 5, 3, 2, 4, 1, 3, 2, 5, 2, 1, 4].map(
                    (height, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 rounded-sm"
                        style={{
                          width: `${(idx % 3) + 2}px`,
                          height: `${Math.min(100, height * 15 + 20)}%`,
                        }}
                      />
                    )
                  )}
                </div>
                <span className="font-mono text-xs tracking-[0.25em] text-slate-700 font-bold mt-2">
                  9824 1004 8821 7732
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">Valid through: Dec 31, 2026</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Turnstile Ready
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 text-center text-xs text-slate-300">
              <p className="flex items-center justify-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Hold phone near turnstile or front desk scanner to enter.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md"
              style={{
                backgroundColor: config.primaryColor,
                color: '#0f172a',
              }}
            >
              Done / Close Pass
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
