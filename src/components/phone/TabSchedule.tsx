'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Users,
  Flame,
  Check,
} from 'lucide-react';
import { GymConfig, GymClass } from '@/types';

interface TabScheduleProps {
  config: GymConfig;
  classes: GymClass[];
  onSelectClass: (c: GymClass) => void;
  bookedClassIds: string[];
}

export const TabSchedule: React.FC<TabScheduleProps> = ({
  config,
  classes,
  onSelectClass,
  bookedClassIds,
}) => {
  const days = [
    { key: 'Mon', label: 'Mon', num: '15' },
    { key: 'Tue', label: 'Tue', num: '16' },
    { key: 'Wed', label: 'Wed', num: '17' },
    { key: 'Thu', label: 'Thu', num: '18' },
    { key: 'Fri', label: 'Fri', num: '19' },
    { key: 'Sat', label: 'Sat', num: '20' },
    { key: 'Sun', label: 'Sun', num: '21' },
  ];

  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const rawCategories =
    config.scheduleConfig?.categories && config.scheduleConfig.categories.length > 0
      ? config.scheduleConfig.categories
      : ['All', 'HIIT', 'Strength', 'Yoga', 'CrossFit', 'Boxing', 'Spin', 'Pilates'];
  // Ensure 'All' is present as the first filter option
  const categories = rawCategories.includes('All')
    ? ['All', ...rawCategories.filter((c) => c !== 'All')]
    : ['All', ...rawCategories];

  // Filter classes by day and category
  const filteredClasses = classes.filter((c) => {
    const matchesDay = c.day === selectedDay;
    const matchesCategory =
      selectedCategory === 'All' || c.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesDay && matchesCategory;
  });

  return (
    <div className="space-y-3.5 pb-16">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">
            {config.scheduleConfig?.title || 'Live Class Schedule'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {config.scheduleConfig?.subtitle || 'Book your workout slot in real time'}
          </p>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${config.primaryColor}20`,
            color: config.primaryColor,
          }}
        >
          {filteredClasses.length} Available
        </span>
      </div>

      {/* 7-Day Date Selector */}
      <div className="flex items-center justify-between gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
        {days.map((day) => {
          const isSelected = selectedDay === day.key;
          return (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`flex-1 py-1.5 flex flex-col items-center rounded-xl transition ${
                isSelected
                  ? 'text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              style={{
                backgroundColor: isSelected ? config.primaryColor : 'transparent',
              }}
            >
              <span className="text-[10px] uppercase font-medium">{day.label}</span>
              <span className="text-xs font-bold">{day.num}</span>
            </button>
          );
        })}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-white text-slate-950 border-white font-bold'
                  : 'bg-slate-800/40 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Class List */}
      <div className="space-y-2.5">
        {filteredClasses.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-800/30 border border-white/5">
            <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No classes scheduled</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Try selecting Monday or another category
            </p>
          </div>
        ) : (
          filteredClasses.map((item) => {
            const isBooked = bookedClassIds.includes(item.id);
            const isAlmostFull = item.spotsLeft <= 3 && item.spotsLeft > 0;
            const isFull = item.spotsLeft <= 0;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 shadow-sm hover:border-white/10 transition flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-slate-950"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.intensity}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  </div>

                  {/* Open spots badge */}
                  <div>
                    {isBooked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Booked
                      </span>
                    ) : isFull ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-400">
                        Class Full
                      </span>
                    ) : isAlmostFull ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {item.spotsLeft} left
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300">
                        {item.spotsLeft} spots
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.time} ({item.duration})
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.room}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200">
                      {item.instructor.substring(0, 1)}
                    </div>
                    <span className="text-xs text-slate-300">{item.instructor}</span>
                  </div>

                  <button
                    disabled={isBooked || isFull}
                    onClick={() => onSelectClass(item)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 ${
                      isBooked
                        ? 'bg-slate-700 text-slate-400 cursor-default'
                        : isFull
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'text-slate-950 shadow-sm'
                    }`}
                    style={{
                      backgroundColor: !isBooked && !isFull ? config.primaryColor : undefined,
                    }}
                  >
                    {isBooked ? (
                      <span>Reserved</span>
                    ) : isFull ? (
                      <span>Waitlist</span>
                    ) : (
                      <span>Reserve Spot</span>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
