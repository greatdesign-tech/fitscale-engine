'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mail,
  Send,
  MessageSquare,
  CheckCheck,
} from 'lucide-react';
import { GymConfig } from '@/types';

interface FloatingAgencyCtaProps {
  config: GymConfig;
  onBookCall: () => void;
}

export const FloatingAgencyCta: React.FC<FloatingAgencyCtaProps> = ({
  config,
  onBookCall,
}) => {
  const rep = config.agencySettings;

  return (
    <div className="w-full lg:w-[380px] shrink-0">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
        {/* Decorative Glow */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: config.primaryColor }}
        />

        {/* Agency Tag */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Exclusive Proposal
          </span>
          <span className="text-xs text-slate-400 font-medium">100% Email-to-Email</span>
        </div>

        {/* Headline */}
        <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
          Want this exact mobile app branded for{' '}
          <span
            className="underline decoration-wavy underline-offset-4"
            style={{ color: config.primaryColor }}
          >
            {config.name}
          </span>
          ?
        </h2>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Stop relying on clunky third-party aggregators. Give your members a premium, white-labeled iOS & Android experience that drives recurring revenue.
        </p>

        {/* Value Proposition Bullets */}
        <div className="space-y-3 my-5">
          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-800/40 border border-white/5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Increase Member Retention by 30%</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gamified streaks, punch-cards & milestone rewards keep members showing up weekly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-800/40 border border-white/5">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Eliminate Class No-Shows</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automated push reminders drop straight onto lock screens 2 hours before class.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-800/40 border border-white/5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Zero Phone Calls Required</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                We respect your time. All pricing, feature specs, and onboarding steps are handled directly over email.
              </p>
            </div>
          </div>
        </div>

        {/* Big CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBookCall}
          className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xl text-slate-950 hover:brightness-105"
          style={{ backgroundColor: config.primaryColor }}
        >
          <Mail className="w-4 h-4" />
          <span>Get App Proposal & Specs via Email</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <p className="text-[11px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>No phone calls • Detailed proposal & pricing in your inbox</span>
        </p>

        {/* Agency Rep Contact Card */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
              {rep.repName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="text-xs font-bold text-white">{rep.repName}</div>
              <div className="text-[10px] text-slate-400">{rep.repTitle}</div>
            </div>
          </div>

          <a
            href={`mailto:${rep.repEmail}?subject=App Proposal for ${encodeURIComponent(
              config.name
            )}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition border border-white/5 shadow-sm"
            title="Email rep directly"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Email Rep</span>
          </a>
        </div>
      </div>
    </div>
  );
};
