'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Calendar, ChevronRight, Zap } from 'lucide-react';
import { Trainer, GymConfig } from '@/types';

interface TabTrainersProps {
  config: GymConfig;
  trainers: Trainer[];
  onSelectTrainer: (trainer: Trainer) => void;
}

export const TabTrainers: React.FC<TabTrainersProps> = ({
  config,
  trainers,
  onSelectTrainer,
}) => {
  return (
    <div className="space-y-3.5 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Coaches & Trainers</h2>
          <p className="text-[11px] text-slate-400">1-on-1 private coaching & assessments</p>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${config.primaryColor}20`,
            color: config.primaryColor,
          }}
        >
          {trainers.length} Coaches
        </span>
      </div>

      <div className="space-y-3">
        {trainers.map((trainer) => (
          <motion.div
            key={trainer.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-slate-800/60 border border-white/5 shadow-sm hover:border-white/10 transition"
          >
            <div className="flex items-start gap-3.5 mb-2.5">
              <img
                src={trainer.avatar}
                alt={trainer.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white truncate">{trainer.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{trainer.rating}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">{trainer.title}</p>

                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-200">From ${Math.round(trainer.rate * 0.6)}</span>
                  <span>•</span>
                  <span>{trainer.sessionsCompleted}+ sessions booked</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
              {trainer.bio}
            </p>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-3">
              {trainer.specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Book button */}
            <button
              onClick={() => onSelectTrainer(trainer)}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5 transition active:scale-98 shadow-sm hover:opacity-95"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book 1-on-1 PT Session</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
