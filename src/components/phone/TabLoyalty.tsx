'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Gift,
  Coffee,
  Percent,
  Check,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardTier, GymConfig } from '@/types';

interface TabLoyaltyProps {
  config: GymConfig;
  streak: number;
  onCheckIn: () => void;
  rewards: RewardTier[];
}

export const TabLoyalty: React.FC<TabLoyaltyProps> = ({
  config,
  streak,
  onCheckIn,
  rewards,
}) => {
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [justStamped, setJustStamped] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<RewardTier | null>(null);

  const handlePunch = () => {
    if (isCheckedInToday) return;

    // Trigger confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: [config.primaryColor, '#F59E0B', '#3B82F6', '#EC4899'],
      });
    } catch (e) {
      // Fallback
    }

    setJustStamped(true);
    setIsCheckedInToday(true);
    onCheckIn();

    setTimeout(() => {
      setJustStamped(false);
    }, 1200);
  };

  const totalMonthlyGoal = 20;
  const currentWorkouts = streak + (isCheckedInToday ? 1 : 0);
  const progressPercent = Math.min(100, Math.round((currentWorkouts / totalMonthlyGoal) * 100));

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Member Rewards</h2>
          <p className="text-[11px] text-slate-400">Punch card, streaks & member perks</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
          <Flame className="w-3.5 h-3.5 fill-amber-400" /> {currentWorkouts} Streak
        </span>
      </div>

      {/* Digital Punch Card / Streak Container */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-white/10 shadow-xl relative overflow-hidden">
        <div
          className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-25"
          style={{ backgroundColor: config.primaryColor }}
        />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              {config.logoMonogram || config.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">
                Official Loyalty Passport
              </div>
              <div className="text-xs font-bold text-white">{config.name}</div>
            </div>
          </div>

          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-950 uppercase"
            style={{ backgroundColor: config.primaryColor }}
          >
            Tier 2 Athlete
          </span>
        </div>

        {/* 10-Punch Stamp Grid */}
        <div className="my-3">
          <div className="text-[11px] text-slate-300 font-medium mb-2 flex items-center justify-between">
            <span>Punch Milestones (This Month)</span>
            <span className="font-bold text-white">
              {currentWorkouts} / {totalMonthlyGoal} logged
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, index) => {
              const isStamped = index < (currentWorkouts % 10 || (currentWorkouts >= 10 ? 10 : 0));
              const isRewardStep = index === 4 || index === 9;

              return (
                <div
                  key={index}
                  className={`h-12 rounded-xl border flex flex-col items-center justify-center relative transition ${
                    isStamped
                      ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400 shadow-sm'
                      : 'border-white/10 bg-slate-800/40 text-slate-500'
                  }`}
                  style={{
                    borderColor: isStamped ? config.primaryColor : undefined,
                  }}
                >
                  {isStamped ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="flex flex-col items-center"
                    >
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: config.primaryColor }}
                      />
                      <span className="text-[9px] font-bold mt-0.5" style={{ color: config.primaryColor }}>
                        #{index + 1}
                      </span>
                    </motion.div>
                  ) : isRewardStep ? (
                    <div className="flex flex-col items-center">
                      <Gift className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                      <span className="text-[9px] text-amber-400 font-bold">Perk</span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {index + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Monthly Goal Progress</span>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ backgroundColor: config.primaryColor }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Daily Check-in Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={isCheckedInToday}
        onClick={handlePunch}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg relative overflow-hidden ${
          isCheckedInToday
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
            : 'text-slate-950 hover:brightness-105 active:scale-98'
        }`}
        style={{
          backgroundColor: !isCheckedInToday ? config.primaryColor : undefined,
        }}
      >
        {isCheckedInToday ? (
          <>
            <Check className="w-4 h-4" />
            <span>Today&apos;s Workout Stamped! (+1 Streak Added)</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Tap to Check In Today & Stamp Card</span>
            <Sparkles className="w-3.5 h-3.5 ml-1" />
          </>
        )}
      </motion.button>

      {/* Unlocked Reward Tiers */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200">Unlocked & Upcoming Rewards</h3>
          <span className="text-[10px] text-slate-400">Scan at front desk</span>
        </div>

        {rewards.map((reward) => {
          const isUnlocked = currentWorkouts >= reward.reqWorkouts || reward.unlocked;

          return (
            <div
              key={reward.id}
              onClick={() => isUnlocked && setActiveVoucher(reward)}
              className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                isUnlocked
                  ? 'bg-slate-800/80 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer shadow-sm'
                  : 'bg-slate-900/40 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                </div>

                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {reward.title}
                    {isUnlocked && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        Claim Ready
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{reward.description}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    Requires {reward.reqWorkouts} workouts (Current: {currentWorkouts})
                  </div>
                </div>
              </div>

              {isUnlocked ? (
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                  style={{
                    backgroundColor: `${config.primaryColor}20`,
                    color: config.primaryColor,
                  }}
                >
                  Tap Code
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-500 shrink-0">Locked</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Voucher Code Sheet Modal */}
      <AnimatePresence>
        {activeVoucher && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full p-5 rounded-3xl bg-slate-900 border border-white/10 text-center shadow-2xl"
            >
              <div
                className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-amber-400 bg-amber-500/20 shadow-md"
              >
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">{activeVoucher.title}</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">{activeVoucher.description}</p>

              <div className="p-3 bg-white text-slate-950 rounded-xl font-mono text-sm font-black tracking-widest my-3 border border-slate-300">
                {activeVoucher.code}
              </div>

              <p className="text-[10px] text-slate-400 mb-4">
                Show this voucher barcode to front desk staff to redeem.
              </p>

              <button
                onClick={() => setActiveVoucher(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-950 transition"
                style={{ backgroundColor: config.primaryColor }}
              >
                Done / Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
