'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Star, CheckCircle2 } from 'lucide-react';
import { Trainer, GymConfig } from '@/types';

interface PtSchedulerModalProps {
  trainer: Trainer | null;
  config: GymConfig;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trainerName: string, duration: string, slot: string) => void;
}

const DEFAULT_MODAL_AVATAR =
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=80';

export const PtSchedulerModal: React.FC<PtSchedulerModalProps> = ({
  trainer,
  config,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [duration, setDuration] = useState<'30m' | '60m'>('60m');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!trainer) return null;

  const slots = ['8:30 AM', '11:00 AM', '2:00 PM', '4:30 PM', '6:00 PM'];
  const trainerRate =
    typeof trainer?.rate === 'number' && !isNaN(trainer.rate) ? trainer.rate : 85;
  const price = duration === '30m' ? Math.round(trainerRate * 0.6) : trainerRate;
  const trainerName = trainer?.name || 'Coach';
  const trainerRating =
    typeof trainer?.rating === 'number' && !isNaN(trainer.rating) ? trainer.rating : 4.9;
  const sessionsCompleted =
    typeof trainer?.sessionsCompleted === 'number' && !isNaN(trainer.sessionsCompleted)
      ? trainer.sessionsCompleted
      : 150;
  const specialties = Array.isArray(trainer?.specialties) ? trainer.specialties : [];
  const avatarUrl = trainer?.avatar || (trainer as any)?.image || DEFAULT_MODAL_AVATAR;
  const primaryColor = config?.primaryColor || '#10B981';

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      onSuccess(trainerName, duration === '30m' ? '30 Minutes' : '60 Minutes', selectedSlot);
      setIsConfirming(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className={`w-full max-h-[92%] overflow-y-auto rounded-t-3xl p-5 shadow-2xl border-t ${
              config?.isDarkMode
                ? 'bg-slate-900 border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-12 h-1 bg-slate-600/40 rounded-full mx-auto mb-3" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={trainerName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_MODAL_AVATAR;
                  }}
                />
                <div>
                  <h3 className="text-sm font-bold">{trainerName}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{trainerRating}</span>
                    <span className="text-slate-400">({sessionsCompleted} sessions)</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 my-3">
                {specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Session Duration Selector */}
            <div className="my-3">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Select Session Length
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDuration('30m')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    duration === '30m'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/10 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                  style={{
                    borderColor: duration === '30m' ? primaryColor : undefined,
                  }}
                >
                  <div className="text-xs font-bold">30 Minutes</div>
                  <div className="text-[11px] text-slate-400">
                    Express Focus • ${Math.round(trainerRate * 0.6)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDuration('60m')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    duration === '60m'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/10 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                  style={{
                    borderColor: duration === '60m' ? primaryColor : undefined,
                  }}
                >
                  <div className="text-xs font-bold">60 Minutes</div>
                  <div className="text-[11px] text-slate-400">Full Assessment • ${trainerRate}</div>
                </button>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="my-3">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Available Times (Tomorrow)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium border transition cursor-pointer ${
                      selectedSlot === slot
                        ? 'bg-white text-slate-950 font-bold border-white'
                        : 'border-white/10 bg-slate-800/30 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Total summary */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-white/5 flex items-center justify-between text-xs my-3">
              <div>
                <span className="text-slate-400">Session Total:</span>
                <span className="ml-1.5 font-bold text-white">${price}.00</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Billed via Membership Card
              </span>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={isConfirming}
              onClick={handleConfirm}
              className="w-full mt-2 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              style={{
                backgroundColor: primaryColor,
                color: '#0f172a',
              }}
            >
              {isConfirming ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Booking 1-on-1...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm PT Session</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
