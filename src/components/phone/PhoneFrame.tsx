'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Battery, Signal, CheckCircle, Sparkles } from 'lucide-react';
import { GymConfig, GymClass, Trainer, ActivePhoneTab } from '@/types';
import { PushNotification } from './PushNotification';
import { BottomNav } from './BottomNav';
import { TabHome } from './TabHome';
import { TabSchedule } from './TabSchedule';
import { TabTrainers } from './TabTrainers';
import { TabLoyalty } from './TabLoyalty';
import { BookingModal } from './BookingModal';
import { AccessPassModal } from './AccessPassModal';
import { PtSchedulerModal } from './PtSchedulerModal';

interface PhoneFrameProps {
  config: GymConfig;
  className?: string;
  allowPushTrigger?: boolean;
  activeTabOverride?: ActivePhoneTab;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  config,
  className = '',
  allowPushTrigger = true,
  activeTabOverride,
}) => {
  const [activeTab, setActiveTab] = useState<ActivePhoneTab>(activeTabOverride || 'home');
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedBookingClass, setSelectedBookingClass] = useState<GymClass | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [bookedClassIds, setBookedClassIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [workoutStreak, setWorkoutStreak] = useState(config.rewardsConfig?.startingStreak ?? 14);
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
    }
  }, [activeTabOverride]);

  useEffect(() => {
    if (config.rewardsConfig?.startingStreak !== undefined) {
      setWorkoutStreak(config.rewardsConfig.startingStreak);
    }
  }, [config.rewardsConfig?.startingStreak]);

  // Realistic time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedHours = hours % 12 || 12;
      setCurrentTime(`${formattedHours}:${formattedMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Drop down push notification after 3.2 seconds
  useEffect(() => {
    if (!allowPushTrigger || !config.features.pushNotification) return;

    const timer = setTimeout(() => {
      setShowPushNotification(true);
    }, 3200);

    return () => clearTimeout(timer);
  }, [allowPushTrigger, config.features.pushNotification, config.slug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Class booking handler
  const handleConfirmClassBooking = (classId: string) => {
    setBookedClassIds((prev) => [...prev, classId]);
    showToast(
      config.scheduleConfig?.confirmationToast || "You're booked! Added to Apple Calendar ✓"
    );
  };

  // PT booking handler
  const handleConfirmPtBooking = (
    trainerName: string,
    duration: string,
    slot: string
  ) => {
    showToast(`PT Session Confirmed with ${trainerName} (${duration}, ${slot})!`);
  };

  // Push notification tap handler
  const handleTapPushNotification = () => {
    setShowPushNotification(false);
    // Find first available class and open booking modal
    if (config.classes && config.classes.length > 0) {
      setActiveTab('schedule');
      setSelectedBookingClass(config.classes[0]);
    }
  };

  return (
    <div
      className={`relative mx-auto w-[360px] h-[730px] rounded-[52px] bg-slate-950 p-3 shadow-2xl border-[8px] border-slate-800 ring-1 ring-white/10 select-none overflow-hidden transition-all duration-300 ${className}`}
      style={
        {
          '--brand-primary': config.primaryColor,
          '--brand-secondary': config.secondaryColor || config.primaryColor,
        } as React.CSSProperties
      }
    >
      {/* Phone Outer Screen Bezel Container */}
      <div
        className={`relative w-full h-full rounded-[42px] overflow-hidden flex flex-col ${
          config.isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        {/* Dynamic Island / Top Notch Pill */}
        <div className="absolute top-2.5 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/60" />
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="relative z-40 px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="text-[12px] font-bold tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center">
              <span className="text-[10px] mr-0.5">98%</span>
              <Battery className="w-4 h-4 fill-slate-200 text-slate-200" />
            </div>
          </div>
        </div>

        {/* Simulated Push Notification Banner */}
        <PushNotification
          config={config}
          isOpen={showPushNotification}
          onClose={() => setShowPushNotification(false)}
          onTap={handleTapPushNotification}
        />

        {/* Main Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 phone-screen-scroll relative">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="tab-home"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <TabHome
                  config={config}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenPass={() => setIsPassModalOpen(true)}
                  onSelectClass={(c) => setSelectedBookingClass(c)}
                  workoutStreak={workoutStreak}
                />
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div
                key="tab-schedule"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <TabSchedule
                  config={config}
                  classes={config.classes}
                  bookedClassIds={bookedClassIds}
                  onSelectClass={(c) => setSelectedBookingClass(c)}
                />
              </motion.div>
            )}

            {activeTab === 'trainers' && (
              <motion.div
                key="tab-trainers"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <TabTrainers
                  config={config}
                  trainers={config.trainers}
                  onSelectTrainer={(t) => setSelectedTrainer(t)}
                />
              </motion.div>
            )}

            {activeTab === 'rewards' && (
              <motion.div
                key="tab-rewards"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <TabLoyalty
                  config={config}
                  streak={workoutStreak}
                  rewards={config.rewards}
                  onCheckIn={() => setWorkoutStreak((prev) => prev + 1)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Toast Message (iOS Style) */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-16 left-4 right-4 z-50 p-3 rounded-2xl bg-slate-900/95 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-semibold"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="leading-snug">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Access Pass Modal */}
        <AccessPassModal
          config={config}
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
        />

        {/* Class Booking Sheet */}
        <BookingModal
          config={config}
          gymClass={selectedBookingClass}
          isOpen={!!selectedBookingClass}
          onClose={() => setSelectedBookingClass(null)}
          onConfirm={handleConfirmClassBooking}
        />

        {/* PT Scheduler Sheet */}
        <PtSchedulerModal
          config={config}
          trainer={selectedTrainer}
          isOpen={!!selectedTrainer}
          onClose={() => setSelectedTrainer(null)}
          onSuccess={handleConfirmPtBooking}
        />

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          config={config}
        />

        {/* iOS Home Indicator Bar */}
        <div className="absolute bottom-1 left-0 right-0 z-50 flex justify-center pointer-events-none pb-1">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
