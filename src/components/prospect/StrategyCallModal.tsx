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
  const repSettings = config.agencySettings || {
    agencyName: 'FitDigital Agency',
    calBookingUrl: '',
    repName: 'Taiwo Adediji',
    repTitle: 'Head of Fitness Partnerships',
    repEmail: 'taiwo.adediji.apps@gmail.com',
    repPhone: '+1 (512) 843-9120',
  };

  const rep = {
    ...repSettings,
    repName:
      !repSettings.repName || repSettings.repName === 'Marcus Vance'
        ? 'Taiwo Adediji'
        : repSettings.repName,
    repEmail:
      !repSettings.repEmail || repSettings.repEmail === 'marcus@fitdigitalapps.io'
        ? 'taiwo.adediji.apps@gmail.com'
        : repSettings.repEmail,
  };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Save lead inquiry record via API if lead is attached
    if (config.attachedLeadId) {
      fetch(`/api/leads/${config.attachedLeadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: `[Email Inquiry] From: ${name} (${email}) | Message: ${message || 'None'}`,
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  const directMailtoUrl = `mailto:${rep.repEmail}?subject=App Proposal Inquiry for ${encodeURIComponent(
    config.name
  )}&body=${encodeURIComponent(
    `Hi ${rep.repName},\n\nI just viewed the interactive app demo for ${config.name} and would like to receive pricing and feature details.\n\nName: ${name || '[My Name]'}\nGym: ${config.name} (${config.location})\n\nQuestions / Notes:\n${message || 'Please send over pricing and timeline.'}\n\nThanks!`
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden my-auto"
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
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-500/20">
                    <Mail className="w-3 h-3" /> Official App Proposal & Specifications
                  </span>
                </div>

                <h3 className="text-xl font-black text-white tracking-tight">
                  Get App Proposal & Pricing for {config.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Fill out your details below and our development team will email you a complete proposal, feature spec, and transparent pricing within 4 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Name & Role
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Alex Johnson (Managing Director / Owner)"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Work Email Address
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
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      We will send the proposal and reply directly to this address.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Questions or Specific Notes (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., Timeline requirements, existing system, or questions on pricing..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
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
                        Sending Request...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Email Inquiry & Get Proposal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-slate-950 shadow-xl"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-white">Inquiry Sent to Our Inbox!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  We have received your request for <span className="text-white font-bold">{config.name}</span>. A detailed proposal and transparent pricing will be emailed directly to <span className="text-emerald-400 font-mono font-bold">{email || 'your email'}</span>.
                </p>

                <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-white/10 text-[11px] text-slate-300 max-w-sm mx-auto text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Solutions Lead:</span>
                    <span className="text-white font-bold">{rep.repName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Direct Contact Email:</span>
                    <span className="text-emerald-400 font-mono font-bold">{rep.repEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Communication Mode:</span>
                    <span className="text-white font-semibold">100% Async Email-to-Email</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Turnaround Time:</span>
                    <span className="text-white font-semibold">&lt; 4 business hours</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <a
                    href={directMailtoUrl}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Email Client</span>
                  </a>

                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Back to Demo
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
