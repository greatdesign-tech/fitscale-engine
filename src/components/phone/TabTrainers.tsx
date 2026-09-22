'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Calendar, ChevronRight } from 'lucide-react';
import { Trainer, GymConfig } from '@/types';

interface TabTrainersProps {
  config: GymConfig;
  trainers?: Trainer[];
  onSelectTrainer: (trainer: Trainer) => void;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=80';

export const TabTrainers: React.FC<TabTrainersProps> = ({
  config,
  trainers = [],
  onSelectTrainer,
}) => {
  const safeTrainers = Array.isArray(trainers) ? trainers.filter(Boolean) : [];
  const primaryColor = config?.primaryColor || '#10B981';

  return (
    <div className="space-y-3.5 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">
            {config?.trainersConfig?.title || 'Coaches & Trainers'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {config?.trainersConfig?.subtitle || '1-on-1 private coaching & assessments'}
          </p>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${primaryColor}20`,
            color: primaryColor,
          }}
        >
          {safeTrainers.length} {safeTrainers.length === 1 ? 'Coach' : 'Coaches'}
        </span>
      </div>

      <div className="space-y-3">
        {safeTrainers.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
            <Award className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
            <h3 className="text-sm font-semibold text-slate-300">No Trainers Listed Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Private coaching schedules will appear here once configured.
            </p>
          </div>
        ) : (
          safeTrainers.map((trainer, idx) => {
            const trainerId = trainer?.id || `trainer-${idx}`;
            const trainerName = trainer?.name || 'Coach';
            const trainerTitle = trainer?.title || 'Personal Trainer & Coach';
            const trainerBio =
              trainer?.bio ||
              'Certified trainer dedicated to personalized coaching and performance results.';
            const trainerRate =
              typeof trainer?.rate === 'number' && !isNaN(trainer.rate) ? trainer.rate : 85;
            const startingRate = Math.round(trainerRate * 0.6);
            const trainerRating =
              typeof trainer?.rating === 'number' && !isNaN(trainer.rating) ? trainer.rating : 4.9;
            const sessionsCompleted =
              typeof trainer?.sessionsCompleted === 'number' && !isNaN(trainer.sessionsCompleted)
                ? trainer.sessionsCompleted
                : 150;
            const specialties = Array.isArray(trainer?.specialties) ? trainer.specialties : [];
            const avatarUrl = trainer?.avatar || (trainer as any)?.image || DEFAULT_AVATAR;

            return (
              <motion.div
                key={trainerId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-slate-800/60 border border-white/5 shadow-sm hover:border-white/10 transition"
              >
                <div className="flex items-start gap-3.5 mb-2.5">
                  <img
                    src={avatarUrl}
                    alt={trainerName}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white truncate">{trainerName}</h3>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{trainerRating}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">{trainerTitle}</p>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-200">From ${startingRate}</span>
                      <span>•</span>
                      <span>{sessionsCompleted}+ sessions booked</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {trainerBio}
                </p>

                {/* Specialties with null-safety */}
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {specialties.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Book button */}
                <button
                  type="button"
                  onClick={() => onSelectTrainer(trainer)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5 transition active:scale-98 shadow-sm hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book 1-on-1 PT Session</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
