'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PRESET_DEMOS } from '@/lib/defaultDemos';
import { saveDemo, getDemoBySlug } from '@/lib/store';
import { attachDemoToLead, getLeadById } from '@/lib/leadStore';
import { GymConfig, Trainer, GymClass, GymLead } from '@/types';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { ShareModal } from '@/components/admin/ShareModal';
import {
  Sparkles,
  Sliders,
  Palette,
  Users,
  Calendar,
  CheckSquare,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Smartphone,
  Eye,
  RefreshCw,
  Bell,
  ArrowRight,
  Home,
  Check,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const PRESET_COLOR_SWATCHES = [
  { name: 'Neon Lime', hex: '#10B981' },
  { name: 'Electric Amber', hex: '#F97316' },
  { name: 'Cyan Sage', hex: '#06B6D4' },
  { name: 'Crimson Pink', hex: '#EC4899' },
  { name: 'Hyper Indigo', hex: '#6366F1' },
  { name: 'Luxury Gold', hex: '#EAB308' },
  { name: 'Pure Red', hex: '#EF4444' },
];

function DemoBuilderContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams?.get('leadId');
  const paramName = searchParams?.get('name');
  const paramCity = searchParams?.get('city');
  const paramEmail = searchParams?.get('email');
  const paramWebsite = searchParams?.get('website');
  const editSlug = searchParams?.get('edit');

  // Active gym configuration state
  const [config, setConfig] = useState<GymConfig>(() => {
    if (editSlug && PRESET_DEMOS[editSlug]) {
      return { ...PRESET_DEMOS[editSlug] };
    }
    return { ...PRESET_DEMOS['apex-fitness'] };
  });

  const [activePresetKey, setActivePresetKey] = useState<string>('apex-fitness');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [attachToLead, setAttachToLead] = useState<boolean>(!!leadId);
  const [attachedLead, setAttachedLead] = useState<GymLead | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');
  const [justAttachedSuccess, setJustAttachedSuccess] = useState(false);

  // Auto-fill from Lead Query Parameters (⚡ Create Demo App)
  useEffect(() => {
    if (leadId) {
      setAttachToLead(true);
      const lead = getLeadById(leadId);
      if (lead) {
        setAttachedLead(lead);
      }

      if (paramName) {
        const cleanSlug = paramName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        const monogram = paramName
          .split(' ')
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase();

        setConfig((prev) => ({
          ...prev,
          name: paramName,
          slug: cleanSlug || 'custom-gym-demo',
          location: paramCity || prev.location,
          logoMonogram: monogram || prev.logoMonogram,
          attachedLeadId: leadId,
          customPushMessage: `🔥 ${paramName} Reminder: 2 spots left for tonight's workout! Tap to reserve.`,
        }));
      }
    } else if (editSlug) {
      const existing = getDemoBySlug(editSlug);
      if (existing) {
        setConfig({ ...existing });
        setActivePresetKey(editSlug);
      }
    }
  }, [leadId, paramName, paramCity, editSlug]);

  // Handle 1-click Preset switch
  const handleLoadPreset = (key: string) => {
    if (PRESET_DEMOS[key]) {
      const preset = PRESET_DEMOS[key];
      setConfig((prev) => ({
        ...preset,
        // Preserve lead info if attached
        name: leadId && paramName ? paramName : preset.name,
        slug: leadId && paramName ? prev.slug : preset.slug,
        location: leadId && paramCity ? paramCity : preset.location,
        attachedLeadId: leadId || prev.attachedLeadId,
      }));
      setActivePresetKey(key);
    }
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const monogram = name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    setConfig((prev) => ({
      ...prev,
      name,
      slug: slug || 'custom-gym',
      logoMonogram: monogram || 'GYM',
    }));
  };

  // Generate demo link & attach to lead record
  const handleGenerateLink = () => {
    const finalSlug =
      config.slug ||
      config.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      'prospect-demo';

    const updatedConfig = { ...config, slug: finalSlug };
    saveDemo(updatedConfig);
    setConfig(updatedConfig);

    // Save to server API
    fetch('/api/demos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedConfig),
    }).catch((err) => console.error('API save error', err));

    // Attach to Lead Record if enabled
    if (attachToLead && leadId) {
      const demoUrl = `/demo/${finalSlug}`;
      attachDemoToLead(leadId, finalSlug, demoUrl);

      // Also patch via API
      fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoSlug: finalSlug, demoUrl }),
      }).catch((err) => console.error('API patch error', err));

      setJustAttachedSuccess(true);
      setTimeout(() => setJustAttachedSuccess(false), 3000);
    }

    setIsShareModalOpen(true);
  };

  // Trainer list mutations
  const handleUpdateTrainer = (index: number, field: keyof Trainer, value: any) => {
    const updated = [...config.trainers];
    updated[index] = { ...updated[index], [field]: value };
    setConfig((prev) => ({ ...prev, trainers: updated }));
  };

  const handleAddTrainer = () => {
    const newTrainer: Trainer = {
      id: `trainer-${Date.now()}`,
      name: 'New Coach',
      title: 'Fitness Coach',
      specialties: ['Strength', 'Conditioning'],
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Certified strength and conditioning coach focused on measurable athletic results.',
      rate: 75,
      rating: 4.95,
      sessionsCompleted: 120,
    };
    setConfig((prev) => ({ ...prev, trainers: [...prev.trainers, newTrainer] }));
  };

  const handleRemoveTrainer = (index: number) => {
    if (config.trainers.length <= 1) return;
    const updated = config.trainers.filter((_, i) => i !== index);
    setConfig((prev) => ({ ...prev, trainers: updated }));
  };

  // Class schedule mutations
  const handleUpdateClass = (index: number, field: keyof GymClass, value: any) => {
    const updated = [...config.classes];
    updated[index] = { ...updated[index], [field]: value };
    setConfig((prev) => ({ ...prev, classes: updated }));
  };

  const handleAddClass = () => {
    const newClass: GymClass = {
      id: `class-${Date.now()}`,
      name: 'Functional Burn',
      time: '6:00 PM',
      duration: '45m',
      instructor: config.trainers[0]?.name || 'Head Coach',
      room: 'Main Studio',
      category: 'HIIT',
      spotsLeft: 4,
      totalSpots: 16,
      day: 'Mon',
      intensity: 'High',
    };
    setConfig((prev) => ({ ...prev, classes: [...prev.classes, newClass] }));
  };

  const handleRemoveClass = (index: number) => {
    if (config.classes.length <= 1) return;
    const updated = config.classes.filter((_, i) => i !== index);
    setConfig((prev) => ({ ...prev, classes: updated }));
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/leads"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Leads</span>
          </Link>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Demo Builder</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                Split-Screen Studio
              </span>
            </h1>
          </div>
        </div>

        {/* Mobile View Toggle Buttons */}
        <div className="flex lg:hidden items-center p-1 bg-slate-800 rounded-xl">
          <button
            onClick={() => setMobileViewMode('editor')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              mobileViewMode === 'editor'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400'
            }`}
          >
            Config Form
          </button>
          <button
            onClick={() => setMobileViewMode('preview')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
              mobileViewMode === 'preview'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Phone Preview</span>
          </button>
        </div>

        {/* Action Button: Generate Demo Link */}
        <div className="flex items-center gap-2">
          <Link
            href={`/demo/${config.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition"
          >
            <span>Live Prospect View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleGenerateLink}
            className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 flex items-center gap-2 transition shadow-lg hover:brightness-105 active:scale-98"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Share2 className="w-4 h-4" />
            <span>Generate Prospect Demo Link</span>
          </button>
        </div>
      </div>

      {/* Unified Lead Integration Banner (if leadId is present) */}
      {leadId && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              ⚡
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Building Custom Prototype for: {config.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Lead #{leadId}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {paramCity || config.location} • {paramEmail || 'Email ready'} • {paramWebsite || ''}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={attachToLead}
              onChange={(e) => setAttachToLead(e.target.checked)}
              className="w-4 h-4 text-emerald-500 rounded accent-emerald-500 cursor-pointer"
            />
            <span>Attach to Lead Record for CSV Export</span>
          </label>
        </div>
      )}

      {/* Main Split-Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Configuration Form */}
        <div
          className={`lg:col-span-7 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 ${
            mobileViewMode === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Preset Selector Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Step 1: Rapid Industry Theme
                </span>
                <h2 className="text-base font-bold text-white">
                  Select Design System Preset
                </h2>
              </div>
              <span className="text-xs text-slate-400">&lt; 10 sec setup</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'apex-fitness', label: 'Athletic Club', color: '#10B981', desc: 'Apex Fitness' },
                { key: 'ironforge-crossfit', label: 'CrossFit Box', color: '#F97316', desc: 'IronForge WOD' },
                { key: 'zenith-pilates', label: 'Pilates / Yoga', color: '#06B6D4', desc: 'Zenith Sanctuary' },
                { key: 'rumble-boxing', label: 'Boxing & HIIT', color: '#EC4899', desc: 'Rumble Boxing' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleLoadPreset(p.key)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-20 ${
                    activePresetKey === p.key
                      ? 'border-white bg-slate-800 shadow-md ring-1 ring-white/20'
                      : 'border-white/5 bg-slate-800/40 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {activePresetKey === p.key && (
                      <span className="text-[10px] text-emerald-400 font-bold">Active</span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{p.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Gym Identity & Branding */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Prospect Brand Identity</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gym Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Apex Fitness Club"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  value={config.location}
                  onChange={(e) => setConfig({ ...config, location: e.target.value })}
                  placeholder="e.g. Austin, TX (Downtown)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Unique Demo Slug
                </label>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-slate-400 font-mono">
                  <span>/demo/</span>
                  <input
                    type="text"
                    value={config.slug}
                    onChange={(e) => setConfig({ ...config, slug: e.target.value })}
                    className="flex-1 bg-transparent text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monogram / Logo Badge
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={config.logoMonogram || ''}
                    onChange={(e) =>
                      setConfig({ ...config, logoMonogram: e.target.value.toUpperCase() })
                    }
                    placeholder="APEX"
                    className="w-24 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">
                    Header badge & app icon
                  </span>
                </div>
              </div>
            </div>

            {/* Colors & Theme */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Primary Brand Accent Color
              </label>

              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                {PRESET_COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setConfig({ ...config, primaryColor: swatch.hex })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      config.primaryColor.toLowerCase() === swatch.hex.toLowerCase()
                        ? 'border-white bg-slate-800 ring-2 ring-white/30 text-white'
                        : 'border-white/10 bg-slate-800/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span>{swatch.name}</span>
                  </button>
                ))}

                {/* Custom Color Input */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800 border border-white/10">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-300">
                    {config.primaryColor}
                  </span>
                </div>
              </div>

              {/* Dark / Light Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">App Dark / Light Mode</div>
                  <div className="text-[11px] text-slate-400">
                    Switch between sleek luxury dark aesthetic or boutique studio light mode
                  </div>
                </div>

                <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, isDarkMode: true })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      config.isDarkMode ? 'bg-slate-700 text-white' : 'text-slate-400'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, isDarkMode: false })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      !config.isDarkMode ? 'bg-white text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Feature Toggles & Modules</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  key: 'classBooking' as const,
                  title: 'Live Class Booking & Slots',
                  desc: '7-day schedule, capacity decrement & calendar sync',
                },
                {
                  key: 'trainerScheduler' as const,
                  title: 'Trainer 1-on-1 PT Scheduler',
                  desc: 'Select 30m/60m session, time slot & price breakdown',
                },
                {
                  key: 'loyaltyPunchCard' as const,
                  title: 'Digital Loyalty & Streak Tracker',
                  desc: 'Interactive attendance check-in stamp & confetti perks',
                },
                {
                  key: 'pushNotification' as const,
                  title: 'Simulated In-App Push Alert',
                  desc: 'Smooth drop-down banner after 3 seconds',
                },
                {
                  key: 'passPurchase' as const,
                  title: 'Instant Pass & QR Turnstile Pass',
                  desc: 'Interactive digital access pass with laser scan bar',
                },
              ].map((feat) => {
                const isEnabled = config.features[feat.key];
                return (
                  <label
                    key={feat.key}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer select-none ${
                      isEnabled
                        ? 'bg-slate-800/80 border-emerald-500/40'
                        : 'bg-slate-900/40 border-white/5 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          features: {
                            ...config.features,
                            [feat.key]: e.target.checked,
                          },
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-0 accent-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{feat.title}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {feat.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Push Notification Copy */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Push Notification Text</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Simulated Lock Screen Alert
              </label>
              <textarea
                rows={2}
                value={
                  config.customPushMessage ||
                  `🔥 ${config.name} Reminder: 2 spots left for 6:00 PM HIIT Burn tonight! Tap to reserve.`
                }
                onChange={(e) =>
                  setConfig({ ...config, customPushMessage: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Trainer Roster Editor */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Trainer Roster ({config.trainers.length})</h3>
              </div>
              <button
                type="button"
                onClick={handleAddTrainer}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Trainer</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.trainers.map((trainer, idx) => (
                <div
                  key={trainer.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Coach #{idx + 1}</span>
                    {config.trainers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTrainer(idx)}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block">Name</label>
                      <input
                        type="text"
                        value={trainer.name}
                        onChange={(e) => handleUpdateTrainer(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block">Title</label>
                      <input
                        type="text"
                        value={trainer.title}
                        onChange={(e) => handleUpdateTrainer(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block">Rate ($/hr)</label>
                      <input
                        type="number"
                        value={trainer.rate}
                        onChange={(e) =>
                          handleUpdateTrainer(idx, 'rate', Number(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block">Avatar Image URL</label>
                    <input
                      type="text"
                      value={trainer.avatar}
                      onChange={(e) => handleUpdateTrainer(idx, 'avatar', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs truncate"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Schedule Highlights */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Class Schedule Highlights ({config.classes.length})</h3>
              </div>
              <button
                type="button"
                onClick={handleAddClass}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.classes.map((cls, idx) => (
                <div
                  key={cls.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Class #{idx + 1}</span>
                    {config.classes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveClass(idx)}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block">Name</label>
                      <input
                        type="text"
                        value={cls.name}
                        onChange={(e) => handleUpdateClass(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block">Time</label>
                      <input
                        type="text"
                        value={cls.time}
                        onChange={(e) => handleUpdateClass(idx, 'time', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block">Day</label>
                      <select
                        value={cls.day}
                        onChange={(e) => handleUpdateClass(idx, 'day', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                      >
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block">Open Spots</label>
                      <input
                        type="number"
                        value={cls.spotsLeft}
                        onChange={(e) =>
                          handleUpdateClass(idx, 'spotsLeft', Number(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Split-Screen Phone Preview */}
        <div
          className={`lg:col-span-5 sticky top-6 flex flex-col items-center justify-center ${
            mobileViewMode === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="w-full max-w-sm mb-3 flex items-center justify-between px-2 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Interactive Prototype
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Real-time updates
            </span>
          </div>

          {/* The Phone Chassis */}
          <div className="relative">
            <PhoneFrame config={config} />
          </div>

          <div className="mt-4 text-center w-full max-w-sm">
            <button
              onClick={handleGenerateLink}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-xs text-slate-950 flex items-center justify-center gap-2 shadow-xl hover:brightness-105 transition active:scale-98"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Share2 className="w-4 h-4" />
              <span>Generate Prospect Demo Link (/demo/{config.slug})</span>
            </button>

            {justAttachedSuccess && (
              <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Demo link attached to lead record in Lead Finder!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        config={config}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}

export default function DemoBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          Loading Demo Builder...
        </div>
      }
    >
      <DemoBuilderContent />
    </Suspense>
  );
}
