'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, X, ChevronRight } from 'lucide-react';
import { GymConfig } from '@/types';

interface PushNotificationProps {
  config: GymConfig;
  isOpen: boolean;
  onClose: () => void;
  onTap: () => void;
}

export const PushNotification: React.FC<PushNotificationProps> = ({
  config,
  isOpen,
  onClose,
  onTap,
}) => {
  const message =
    config.customPushMessage ||
    `🔥 ${config.name} Reminder: 2 spots left for 6:00 PM HIIT Burn tonight! Tap to reserve.`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="absolute top-12 left-3 right-3 z-50 cursor-pointer"
          onClick={onTap}
        >
          <div className="bg-slate-900/95 text-slate-100 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl ring-1 ring-black/40">
            <div className="flex items-start justify-between gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Flame className="w-4 h-4 text-white animate-pulse" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                  <span className="font-semibold text-slate-200 tracking-wide truncate max-w-[130px]">
                    {config.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono">now</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug line-clamp-2">
                  {message}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] font-medium"
                 style={{ color: config.primaryColor }}>
              <span>Tap to reserve instant spot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
