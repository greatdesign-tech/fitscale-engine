import React from 'react';
import Link from 'next/link';
import { PRESET_DEMOS } from '@/lib/defaultDemos';
import {
  Sparkles,
  Smartphone,
  Zap,
  Users,
  ArrowRight,
  Calendar,
  Bell,
  Award,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const presets = Object.values(PRESET_DEMOS);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg">
            FS
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight">
              FitScale Engine
            </span>
            <span className="block text-[10px] text-emerald-400 font-semibold">
              GymLead Finder + Mobile Demo Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/demo/apex-fitness"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/5"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Try Live Demo</span>
          </Link>

          <Link
            href="/admin/builder"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-md flex items-center gap-1.5 hover:brightness-105"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Build Demo App</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-12 pb-16 px-4 sm:px-6 text-center max-w-5xl mx-auto overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Unified B2B Agency Sales Acceleration Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
          Find Gym Leads.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Build Interactive Demos.
          </span>{' '}
          Close High-Ticket Apps.
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          FitScale Engine unites **GymLead Finder** with our interactive **FitApp Demo Builder**. Discover gyms lacking dedicated mobile apps, auto-generate realistic branded iPhone prototypes in under 60 seconds, and export enriched cold outreach CSVs.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/admin/builder"
            className="px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 transition shadow-xl hover:shadow-emerald-500/25 active:scale-98"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Build a Gym Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/demo/apex-fitness"
            className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-white/10 flex items-center gap-2 transition"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Test Client Concept</span>
          </Link>

          <Link
            href="/admin/leads"
            className="px-5 py-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-white/10 flex items-center gap-2 transition"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Lead Finder</span>
          </Link>
        </div>

        {/* Agency Metrics Banner */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">4.2x</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Outreach Response Rate</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="text-xl sm:text-2xl font-black text-cyan-400">&lt; 60s</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Demo Setup per Prospect</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="text-xl sm:text-2xl font-black text-amber-400">1-Click</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Lead Data Transfer</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="text-xl sm:text-2xl font-black text-pink-400">CSV Export</div>
            <div className="text-[11px] text-slate-400 mt-0.5">With Personalized Demo URLs</div>
          </div>
        </div>
      </header>

      {/* 3-Step Unified Engine Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Seamless Agency Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            How the FitScale Workflow Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-white">Target High-Opportunity Gyms</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use **Lead Finder** to browse gym prospects in top US markets. Identify businesses stuck with paper punch cards or clunky web-only aggregators.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-white">Click &quot;⚡ Create Demo App&quot;</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Carries the gym&apos;s name, city, and website straight into the **Demo Builder**. A custom public link is generated instantly with working class bookings and simulated push alerts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-white">Export Enriched Outreach CSV</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Demos attach back to the lead record. Export your full campaign CSV with personalized demo URLs ready to load into Instantly, Smartlead, or Lemlist.
            </p>
          </div>
        </div>
      </section>

      {/* Pre-built Gym Concepts */}
      <section id="demos" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Interactive Concepts
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pre-Configured Demos Ready to Share
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Click any concept to explore the live, interactive prospect experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {presets.map((gym) => (
            <div
              key={gym.slug}
              className="rounded-3xl bg-slate-900/80 border border-white/10 p-5 flex flex-col justify-between hover:border-white/20 transition shadow-lg group relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: gym.primaryColor }}
              />

              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-md"
                    style={{ backgroundColor: gym.primaryColor }}
                  >
                    {gym.logoMonogram}
                  </div>
                  <span
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${gym.primaryColor}20`,
                      color: gym.primaryColor,
                    }}
                  >
                    {gym.industryType}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                  {gym.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{gym.location}</p>
                <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {gym.tagline}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {gym.classes.length} Classes
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {gym.trainers.length} Trainers
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {gym.rewards.length} Rewards
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3">
                <Link
                  href={`/demo/${gym.slug}`}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-950 text-center transition hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md"
                  style={{ backgroundColor: gym.primaryColor }}
                >
                  <span>Open Interactive Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>FitScale Engine © 2026. Merged GymLead Finder + FitApp Demo Platform.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/admin/builder" className="text-emerald-400 hover:underline font-semibold transition">
              ⚡ Demo Builder
            </Link>
            <Link href="/admin/leads" className="hover:text-white transition">
              Lead Finder
            </Link>
            <Link href="/demo/apex-fitness" className="hover:text-white transition">
              Apex Concept
            </Link>
            <Link href="/demo/ironforge-crossfit" className="hover:text-white transition">
              CrossFit Concept
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
