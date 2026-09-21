'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Smartphone,
  Sparkles,
  Zap,
  ArrowUpRight,
  Menu,
  X,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  Flame,
  Home,
} from 'lucide-react';
import { getAllLeads } from '@/lib/leadStore';
import { getAllDemos } from '@/lib/store';

export default function AdminSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [leadStats, setLeadStats] = useState({ total: 9, noApp: 5, demoReady: 4 });
  const [activeDemos, setActiveDemos] = useState<{ name: string; slug: string; city?: string }[]>([
    { name: 'Apex Athletic Club', slug: 'apex-fitness', city: 'Austin, TX' },
    { name: 'IronForge CrossFit', slug: 'ironforge-crossfit', city: 'Denver, CO' },
    { name: 'Zenith Pilates', slug: 'zenith-pilates', city: 'Santa Monica, CA' },
    { name: 'Rumble Boxing Lab', slug: 'rumble-boxing', city: 'Miami, FL' },
  ]);

  useEffect(() => {
    try {
      const leads = getAllLeads();
      const noApp = leads.filter((l) => l.appStatus !== 'demo_ready').length;
      const demoReady = leads.filter((l) => l.appStatus === 'demo_ready').length;
      setLeadStats({ total: leads.length, noApp, demoReady });

      const all = getAllDemos();
      if (all.length > 0) {
        setActiveDemos(all.map((d) => ({ name: d.name, slug: d.slug, city: d.location })));
      }
    } catch (e) {
      // Fallback stats
    }
  }, [pathname]);

  const navItems = [
    {
      label: 'Lead Finder',
      href: '/admin/leads',
      icon: Users,
      badge: `${leadStats.noApp} To Pitch`,
      badgeColor: 'bg-amber-500/20 text-amber-400',
    },
    {
      label: 'Demo Builder',
      href: '/admin/builder',
      icon: Smartphone,
      badge: 'Live Preview',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10 sticky top-0 z-40">
        <Link href="/admin/leads" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
            FS
          </div>
          <span className="font-extrabold text-sm text-white tracking-tight">
            FitScale Engine
          </span>
        </Link>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/95 md:bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between transition-transform duration-200 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md group-hover:scale-105 transition">
                FS
              </div>
              <div>
                <span className="block font-black text-sm text-white tracking-tight">
                  FitScale Engine
                </span>
                <span className="block text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">
                  Agency Sales Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Primary Navigation Sections */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Core Platform
            </div>

            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/admin/leads' && pathname === '/admin');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-950 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Quick Pre-Seeded Gym Demos */}
          <div className="p-3 pt-2 space-y-1 border-t border-white/5">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Active Demo Links</span>
              <span className="text-emerald-400">{leadStats.demoReady} Live</span>
            </div>

            {activeDemos.slice(0, 6).map((d) => (
              <Link
                key={d.slug}
                href={`/demo/${d.slug}`}
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition group"
              >
                <span className="truncate max-w-[130px]">{d.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar Footer: Pipeline Metrics */}
        <div className="p-4 border-t border-white/10 bg-slate-950/40 m-3 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-semibold text-slate-200">Outreach Pipeline</span>
            <span className="text-emerald-400 font-bold">{leadStats.total} Prospects</span>
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Opportunity (No App):</span>
              <span className="font-bold text-amber-400">{leadStats.noApp}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Demos Attached:</span>
              <span className="font-bold text-emerald-400">{leadStats.demoReady}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <Link href="/" className="flex items-center gap-1 hover:text-white transition">
              <Home className="w-3 h-3" />
              <span>Agency Landing</span>
            </Link>
            <span className="text-slate-500">v2.0 Unified</span>
          </div>
        </div>
      </aside>

      {/* Main Page Content Wrapper */}
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}
