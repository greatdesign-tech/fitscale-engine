'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, CheckCircle, Users, Sparkles } from 'lucide-react';
import { GymClass, GymConfig } from '@/types';

interface BookingModalProps {
  gymClass: GymClass | null;
  config: GymConfig;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  gymClass,
  config,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [syncCalendar, setSyncCalendar] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!gymClass) return null;

  const handleBook = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(gymClass.id);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`w-full max-h-[90%] overflow-y-auto rounded-t-3xl p-5 shadow-2xl border-t ${
              config.isDarkMode
                ? 'bg-slate-900 border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Grab handle */}
            <div className="w-12 h-1 bg-slate-600/40 rounded-full mx-auto mb-4" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-950 inline-block mb-1"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {gymClass.category}
                </span>
                <h3 className="text-lg font-bold leading-tight">{gymClass.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instructor: <span className="font-semibold text-slate-200">{gymClass.instructor}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details pills */}
            <div className="grid grid-cols-2 gap-2 my-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Time & Duration</div>
                  <div className="text-xs font-semibold text-slate-200">
                    {gymClass.time} ({gymClass.duration})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Studio Location</div>
                  <div className="text-xs font-semibold text-slate-200">{gymClass.room}</div>
                </div>
              </div>
            </div>

            {/* Spots remaining badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-white/5 my-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300 font-medium">Availability</span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                {gymClass.spotsLeft} spots remaining
              </span>
            </div>

            {/* Sync with calendar option */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5 my-3 cursor-pointer">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Sync to Apple / Google Calendar</span>
              </div>
              <input
                type="checkbox"
                checked={syncCalendar}
                onChange={(e) => setSyncCalendar(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
            </label>

            {/* CTA button */}
            <button
              disabled={isSubmitting || gymClass.spotsLeft <= 0}
              onClick={handleBook}
              className="w-full mt-3 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg active:scale-98"
              style={{
                backgroundColor: config.primaryColor,
                color: '#0f172a',
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Securing Spot...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Reservation</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
