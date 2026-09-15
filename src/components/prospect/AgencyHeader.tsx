'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, QrCode, Bell, Sliders, ArrowLeft, ExternalLink } from 'lucide-react';
import { GymConfig } from '@/types';

interface AgencyHeaderProps {
  config: GymConfig;
  onTriggerPush: () => void;
  onOpenQr: () => void;
}

export const AgencyHeader: React.FC<AgencyHeaderProps> = ({
  config,
  onTriggerPush,
  onOpenQr,
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Agency branding & Prospect Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/leads"
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>FitScale Leads</span>
          </Link>

          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Interactive Client Prototype
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              Custom Mobile App Concept for{' '}
              <span className="text-emerald-400 font-extrabold">{config.name}</span>
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Re-trigger Push Notification */}
          <button
            onClick={onTriggerPush}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition shadow-sm"
            title="Simulate iOS Push Alert"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Test Push Notification</span>
          </button>

          {/* QR Code trigger */}
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition shadow-sm"
            title="Scan with smartphone camera"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Scan on Real Phone</span>
          </button>

          {/* Edit in Builder */}
          <Link
            href={`/admin/builder?edit=${config.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Demo</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
