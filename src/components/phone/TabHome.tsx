'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  QrCode,
  Flame,
  ChevronRight,
  Clock,
  Sparkles,
  MapPin,
  TrendingUp,
  Award,
} from 'lucide-react';
import { GymConfig, GymClass } from '@/types';

interface TabHomeProps {
  config: GymConfig;
  onNavigateTab: (tab: 'home' | 'schedule' | 'trainers' | 'rewards') => void;
  onOpenPass: () => void;
  onSelectClass: (c: GymClass) => void;
  workoutStreak: number;
}

export const TabHome: React.FC<TabHomeProps> = ({
  config,
  onNavigateTab,
  onOpenPass,
  onSelectClass,
  workoutStreak,
}) => {
  const featuredClass = config.classes[0] || null;

  return (
    <div className="space-y-4 pb-16">
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.logoMonogram || config.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide">
              {config.location}
            </div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Welcome back, Alex!
            </h2>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-slate-950 shadow-sm"
            style={{ backgroundColor: config.primaryColor }}
          >
            VIP Member
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
            {config.industryType}
          </span>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onNavigateTab('schedule')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 transition group text-center"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition text-slate-950"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Book Class</span>
          <span className="text-[9px] text-slate-400">Live Schedule</span>
        </button>

        <button
          onClick={onOpenPass}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 transition group text-center relative overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-700/80 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition">
            <QrCode className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Scan Pass</span>
          <span className="text-[9px] text-slate-400">Turnstile Entry</span>
        </button>

        <button
          onClick={() => onNavigateTab('rewards')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 transition group text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Streak</span>
          <span className="text-[9px] text-amber-400 font-bold">{workoutStreak} Days 🔥</span>
        </button>
      </div>

      {/* Featured / Next Up Class Card */}
      {featuredClass && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-white/10 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
            style={{ backgroundColor: config.primaryColor }}
          />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Up Next Today
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold animate-pulse">
              Only {featuredClass.spotsLeft} Spots Left
            </span>
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            {featuredClass.name}
          </h3>

          <div className="flex items-center gap-3 text-xs text-slate-300 mb-3">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {featuredClass.time} ({featuredClass.duration})
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
              {featuredClass.room}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                {featuredClass.instructor.substring(0, 1)}
              </div>
              <span className="text-xs text-slate-300 font-medium">
                {featuredClass.instructor}
              </span>
            </div>

            <button
              onClick={() => onSelectClass(featuredClass)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1 transition shadow-sm hover:opacity-95 active:scale-95"
              style={{ backgroundColor: config.primaryColor }}
            >
              <span>Reserve</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Member Activity & Streak Banner */}
      <div
        onClick={() => onNavigateTab('rewards')}
        className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-slate-800/70 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              Monthly Attendance
              <span className="text-[10px] text-emerald-400 font-normal">On Track</span>
            </div>
            <div className="text-[11px] text-slate-400">
              12 workouts logged • Next reward in 3 check-ins
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Quick Access Pass Preview Bar */}
      <div
        onClick={onOpenPass}
        className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition"
      >
        <div className="flex items-center gap-2.5">
          <QrCode className="w-5 h-5 text-slate-400" />
          <div>
            <div className="text-xs font-bold text-slate-200">Express Gym Check-in</div>
            <div className="text-[10px] text-slate-400">Tap to display digital barcode</div>
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-lg"
          style={{
            backgroundColor: `${config.primaryColor}20`,
            color: config.primaryColor,
          }}
        >
          Open Pass
        </span>
      </div>
    </div>
  );
};
