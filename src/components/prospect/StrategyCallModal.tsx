'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  Send,
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
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const userNotes = message && message.trim() ? message.trim() : 'None provided';

    const payload = {
      name: name.trim(),
      email: email.trim(),
      notes: userNotes,
      gymName: config.name,
      attachedLeadId: config.attachedLeadId,
    };

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn('Proposal submission status:', res.status, data);
      }
    } catch (err) {
      console.warn('Proposal submission network notice:', err);
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto"
          >
            {/* Background Glow */}
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: config.primaryColor }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSubmitted ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-500/20">
                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Official App Proposal & Specifications
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Get App Proposal & Pricing for {config.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-5">
                  Fill out your details below and our development team will email you a complete proposal, feature spec, and transparent pricing within 4 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-300 mb-1.5">
                      Your Name & Role
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Alex Johnson (Managing Director / Owner)"
                        className="w-full pl-10 pr-4 py-3.5 sm:py-4 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-300 mb-1.5">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@yourgym.com"
                        className="w-full pl-10 pr-4 py-3.5 sm:py-4 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-400 mt-1.5 block">
                      We will send the proposal and reply directly to this address.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-300 mb-1.5">
                      Questions or Specific Notes (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., Timeline requirements, existing system, or questions on pricing..."
                        className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3.5 sm:py-4 px-5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 flex items-center justify-center gap-2 transition shadow-xl active:scale-98"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Sending Request...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send My Custom Proposal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center space-y-5">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-slate-950 shadow-xl"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Proposal Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  We have received your request for <span className="text-white font-bold">{config.name}</span>. Your customized app blueprint, feature specs, and pricing will arrive in your inbox at <span className="text-emerald-400 font-mono font-bold">{email || 'your email'}</span> within 4 hours.
                </p>

                <div className="pt-3 flex justify-center">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 transition shadow-xl hover:brightness-105 active:scale-98 cursor-pointer"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Back to Interactive Demo
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const EmailInquiryModal = StrategyCallModal;
