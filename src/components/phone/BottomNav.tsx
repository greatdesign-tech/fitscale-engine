'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Award } from 'lucide-react';
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
    <div className="absolute bottom-0 left-0 right-0 z-40 px-3 pb-5 pt-2 bg-slate-950/90 backdrop-blur-md border-t border-white/10 select-none">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3.5 text-xs font-medium active:scale-95 transition-transform duration-150 group cursor-pointer"
            >
              {/* Soft translucent brand pill container */}
              <div className="relative flex items-center justify-center px-3 py-1 rounded-full">
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: config.primaryColor,
                      opacity: 0.15,
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 z-10 relative transition-transform duration-150 ${
                    isActive ? 'scale-105' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                  style={{
                    color: isActive ? config.primaryColor : undefined,
                  }}
                />
              </div>

              <span
                className={`text-[10px] mt-0.5 transition-colors z-10 relative ${
                  isActive ? 'font-bold' : 'text-slate-400'
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
                  className="w-4 h-0.5 rounded-full mt-0.5 z-10 relative"
                  style={{ backgroundColor: config.primaryColor }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

