'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { GymConfig } from '@/types';

interface StrategyCallModalProps {
  config: GymConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyCallModal: React.FC<StrategyCallModalProps> = ({
  config,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [timeSlot, setTimeSlot] = useState('Tomorrow 2:00 PM EST');
  const [objective, setObjective] = useState('Boost Member Retention (+30%)');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: config.primaryColor }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSubmitted ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    Agency Fast-Track Booking
                  </span>
                </div>

                <h3 className="text-xl font-black text-white tracking-tight">
                  Launch {config.name}&apos;s Custom App
                </h3>
                <p className="text-xs text-slate-300 mt-1 mb-5">
                  Lock in your 20-minute tailored tech & app roadmap session with Marcus Vance ({config.agencySettings.agencyName}).
                </p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Name / Role
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Alex Johnson (Managing Director)"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Work Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="owner@yourgym.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mobile Phone (for SMS confirmation)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Preferred Call Window
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Tomorrow 10:00 AM EST">Tomorrow 10:00 AM EST</option>
                      <option value="Tomorrow 2:00 PM EST">Tomorrow 2:00 PM EST</option>
                      <option value="Thursday 11:30 AM EST">Thursday 11:30 AM EST</option>
                      <option value="Thursday 4:00 PM EST">Thursday 4:00 PM EST</option>
                      <option value="Friday 1:00 PM EST">Friday 1:00 PM EST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Primary Strategic Priority
                    </label>
                    <select
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Boost Member Retention (+30%)">Boost Member Retention (+30%)</option>
                      <option value="Eliminate Class No-Shows with Push">Eliminate Class No-Shows with Push</option>
                      <option value="Self-Serve 1-on-1 PT Bookings">Self-Serve 1-on-1 PT Bookings</option>
                      <option value="Replace Mindbody/Wodify Custom Frontend">Replace Third-Party Frontend</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs font-extrabold text-slate-950 flex items-center justify-center gap-2 transition shadow-xl active:scale-98"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Scheduling Call...
                      </span>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Confirm 20-Min Strategy Call</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-slate-950 shadow-xl"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-white">Call Confirmed!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  We have reserved your strategy slot for <span className="text-white font-bold">{timeSlot}</span>. An invite has been sent to <span className="text-emerald-400 font-mono">{email || 'your email'}</span>.
                </p>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-white/10 text-[11px] text-slate-300 max-w-sm mx-auto text-left space-y-1">
                  <div>• Dedicated Rep: {config.agencySettings.repName}</div>
                  <div>• Custom App Spec: {config.name} ({config.location})</div>
                  <div>• Estimated Go-Live: Within 14 business days</div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Back to Demo
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
