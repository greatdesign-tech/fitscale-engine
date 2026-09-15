'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Award, Flame } from 'lucide-react';
import { ActivePhoneTab, GymConfig } from '@/types';

interface BottomNavProps {
  activeTab: ActivePhoneTab;
  onTabChange: (tab: ActivePhoneTab) => void;
  config: GymConfig;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  config,
}) => {
  const tabs = [
    { id: 'home' as ActivePhoneTab, label: 'Home', icon: Home },
    { id: 'schedule' as ActivePhoneTab, label: 'Schedule', icon: Calendar },
    { id: 'trainers' as ActivePhoneTab, label: 'Trainers', icon: Users },
    { id: 'rewards' as ActivePhoneTab, label: 'Rewards', icon: Award },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 px-3 pb-5 pt-2 bg-slate-950/90 backdrop-blur-md border-t border-white/10">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 transition-colors text-xs font-medium"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={{
                    color: isActive ? config.primaryColor : undefined,
                  }}
                />

                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -inset-1 rounded-full blur-xs opacity-40 -z-10"
                    style={{ backgroundColor: config.primaryColor }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}
              </div>

              <span
                className={`text-[10px] mt-1 transition-colors ${
                  isActive ? 'font-bold text-white' : 'text-slate-400'
                }`}
                style={{
                  color: isActive ? config.primaryColor : undefined,
                }}
              >
                {tab.label}
              </span>

              {/* iOS-style bottom bar indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="w-4 h-0.5 rounded-full mt-0.5"
                  style={{ backgroundColor: config.primaryColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
