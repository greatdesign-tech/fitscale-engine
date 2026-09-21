'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PRESET_DEMOS } from '@/lib/defaultDemos';
import { saveDemo, getDemoBySlug, getAllDemos, publishDemo } from '@/lib/store';
import { attachDemoToLead, getLeadById } from '@/lib/leadStore';
import { buildShareableDemoUrl } from '@/lib/demoUrlEncoder';
import {
  GymConfig,
  Trainer,
  GymClass,
  RewardTier,
  GymLead,
  HomeSectionConfig,
  ScheduleSectionConfig,
  TrainersSectionConfig,
  RewardsSectionConfig,
  ActivePhoneTab,
} from '@/types';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { ShareModal } from '@/components/admin/ShareModal';
import {
  Sliders,
  Palette,
  Users,
  Calendar,
  CheckSquare,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  Bell,
  Home,
  Gift,
  Award,
  CheckCircle2,
  ArrowLeft,
  Flame,
  Sparkles,
  Tag,
  Dumbbell,
  Check,
  RefreshCw,
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

type BuilderTab = 'brand' | 'home' | 'schedule' | 'trainers' | 'rewards' | 'settings';

const phoneTabMapping: Record<BuilderTab, ActivePhoneTab> = {
  brand: 'home',
  home: 'home',
  schedule: 'schedule',
  trainers: 'trainers',
  rewards: 'rewards',
  settings: 'home',
};

const ensureConfigs = (cfg: GymConfig): GymConfig => ({
  ...cfg,
  homeConfig: {
    greeting: cfg.homeConfig?.greeting ?? 'Welcome back, Alex!',
    memberBadge: cfg.homeConfig?.memberBadge ?? 'VIP Member',
    membershipCardTitle: cfg.homeConfig?.membershipCardTitle ?? 'Monthly Attendance',
    quickAction1Label: cfg.homeConfig?.quickAction1Label ?? 'Book Class',
    quickAction2Label: cfg.homeConfig?.quickAction2Label ?? 'Scan Pass',
    quickAction3Label: cfg.homeConfig?.quickAction3Label ?? 'Streak',
    featuredClassBadge: cfg.homeConfig?.featuredClassBadge ?? 'Up Next Today',
  },
  scheduleConfig: {
    title: cfg.scheduleConfig?.title ?? 'Live Class Schedule',
    subtitle: cfg.scheduleConfig?.subtitle ?? 'Book your workout slot in real time',
    categories:
      cfg.scheduleConfig?.categories && cfg.scheduleConfig.categories.length > 0
        ? cfg.scheduleConfig.categories
        : ['All', 'HIIT', 'Strength', 'Yoga', 'CrossFit', 'Boxing'],
    confirmationToast:
      cfg.scheduleConfig?.confirmationToast ?? "You're booked! Added to Apple Calendar ✓",
  },
  trainersConfig: {
    title: cfg.trainersConfig?.title ?? 'Coaches & Trainers',
    subtitle: cfg.trainersConfig?.subtitle ?? '1-on-1 private coaching & assessments',
  },
  rewardsConfig: {
    title: cfg.rewardsConfig?.title ?? 'Member Rewards',
    subtitle: cfg.rewardsConfig?.subtitle ?? 'Punch card, streaks & member perks',
    tierBadge: cfg.rewardsConfig?.tierBadge ?? 'Tier 2 Athlete',
    monthlyGoal: cfg.rewardsConfig?.monthlyGoal ?? 20,
    startingStreak: cfg.rewardsConfig?.startingStreak ?? 14,
  },
  rewards: cfg.rewards ?? [],
});

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
    if (typeof window !== 'undefined' && editSlug) {
      const existing = getDemoBySlug(editSlug);
      if (existing) return ensureConfigs(existing);
    }
    if (editSlug && PRESET_DEMOS[editSlug]) {
      return ensureConfigs(PRESET_DEMOS[editSlug]);
    }
    return ensureConfigs(PRESET_DEMOS['apex-fitness']);
  });

  const [activeBuilderTab, setActiveBuilderTab] = useState<BuilderTab>('brand');
  const [activePresetKey, setActivePresetKey] = useState<string>(editSlug || 'apex-fitness');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [attachToLead, setAttachToLead] = useState<boolean>(!!leadId);
  const [attachedLead, setAttachedLead] = useState<GymLead | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');
  const [justAttachedSuccess, setJustAttachedSuccess] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Permanent Publishing States
  const [isDirty, setIsDirty] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [availableDemos, setAvailableDemos] = useState<GymConfig[]>([]);

  // Load all available demos on mount
  useEffect(() => {
    try {
      const all = getAllDemos();
      setAvailableDemos(all);
    } catch (e) {
      // Ignore
    }
  }, []);

  // Auto-fill from Lead Query Parameters (⚡ Create Demo App) or editSlug
  useEffect(() => {
    if (leadId) {
      setAttachToLead(true);
      const lead = getLeadById(leadId);
      if (lead) {
        setAttachedLead(lead);
      }

      // Check if this lead already has a custom demo saved
      const targetSlug = editSlug || (lead && lead.demoSlug);
      if (targetSlug) {
        const existing = getDemoBySlug(targetSlug);
        if (existing) {
          setConfig(ensureConfigs(existing));
          setActivePresetKey(targetSlug);
          setIsDirty(false);
          return;
        }
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

        setConfig((prev) =>
          ensureConfigs({
            ...prev,
            name: paramName,
            slug: cleanSlug || 'custom-gym-demo',
            location: paramCity || prev.location,
            logoMonogram: monogram || prev.logoMonogram,
            attachedLeadId: leadId,
            customPushMessage: `🔥 ${paramName} Reminder: 2 spots left for tonight's workout! Tap to reserve.`,
          })
        );
        setIsDirty(true);
      }
    } else if (editSlug) {
      const existing = getDemoBySlug(editSlug);
      if (existing) {
        setConfig(ensureConfigs(existing));
        setActivePresetKey(editSlug);
        setIsDirty(false);
      }
    }
  }, [leadId, paramName, paramCity, editSlug]);

  // Publish Changes action: saves to localStorage, server disk (data/demos.json), and lead record
  const handlePublishChanges = async () => {
    setIsPublishing(true);
    const finalSlug =
      config.slug ||
      config.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      'custom-gym-demo';

    const updatedConfig = ensureConfigs({ ...config, slug: finalSlug });

    // Save to local storage and sync to disk API
    const saved = await publishDemo(updatedConfig);
    setConfig(saved);

    // Attach to Lead Record if enabled
    if (attachToLead && leadId) {
      const demoUrl = buildShareableDemoUrl(saved);
      attachDemoToLead(leadId, finalSlug, demoUrl);

      fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoSlug: finalSlug, demoUrl }),
      }).catch((err) => console.error('API patch error', err));

      setJustAttachedSuccess(true);
      setTimeout(() => setJustAttachedSuccess(false), 3000);
    }

    // Refresh demo lists
    try {
      setAvailableDemos(getAllDemos());
    } catch (e) {
      // Ignore
    }

    setIsDirty(false);
    setIsPublishing(false);
    setPublishFeedback(`✓ Changes published & permanent at /demo/${finalSlug}!`);
    setTimeout(() => setPublishFeedback(null), 6000);
  };

  // Switch between existing gym demos
  const handleSwitchApp = (selectedSlug: string) => {
    const target = getDemoBySlug(selectedSlug);
    if (target) {
      setConfig(ensureConfigs(target));
      setActivePresetKey(selectedSlug);
      setIsDirty(false);
      setPublishFeedback(null);
    }
  };

  // Start fresh customized gym proposal
  const handleStartNewDemo = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newSlug = `gym-prototype-${randomSuffix}`;
    const base = ensureConfigs(PRESET_DEMOS['apex-fitness']);
    const fresh: GymConfig = {
      ...base,
      name: 'Custom Gym Prototype',
      slug: newSlug,
      location: 'Austin, TX',
      logoMonogram: 'GYM',
      attachedLeadId: undefined,
    };
    setConfig(fresh);
    setActivePresetKey('apex-fitness');
    setIsDirty(true);
    setPublishFeedback(null);
  };

  // Handle 1-click Preset switch
  const handleLoadPreset = (key: string) => {
    if (PRESET_DEMOS[key]) {
      const preset = ensureConfigs(PRESET_DEMOS[key]);
      setConfig((prev) => ({
        ...preset,
        name: leadId && paramName ? paramName : preset.name,
        slug: leadId && paramName ? prev.slug : preset.slug,
        location: leadId && paramCity ? paramCity : preset.location,
        attachedLeadId: leadId || prev.attachedLeadId,
      }));
      setActivePresetKey(key);
      setIsDirty(true);
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
    setIsDirty(true);
  };

  // Section configs mutation helpers
  const handleUpdateHomeConfig = (field: keyof HomeSectionConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      homeConfig: {
        ...(prev.homeConfig as HomeSectionConfig),
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleUpdateScheduleConfig = (field: keyof ScheduleSectionConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      scheduleConfig: {
        ...(prev.scheduleConfig as ScheduleSectionConfig),
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    const currentCats = config.scheduleConfig?.categories || [];
    if (!currentCats.includes(trimmed)) {
      handleUpdateScheduleConfig('categories', [...currentCats, trimmed]);
    }
    setNewCategoryInput('');
    setIsDirty(true);
  };

  const handleRemoveCategory = (catToRemove: string) => {
    if (catToRemove === 'All') return;
    const currentCats = config.scheduleConfig?.categories || [];
    handleUpdateScheduleConfig(
      'categories',
      currentCats.filter((c) => c !== catToRemove)
    );
    setIsDirty(true);
  };

  const handleUpdateTrainersConfig = (field: keyof TrainersSectionConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      trainersConfig: {
        ...(prev.trainersConfig as TrainersSectionConfig),
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleUpdateRewardsConfig = (field: keyof RewardsSectionConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      rewardsConfig: {
        ...(prev.rewardsConfig as RewardsSectionConfig),
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  // Trainer list mutations
  const handleUpdateTrainer = (index: number, field: keyof Trainer, value: any) => {
    const updated = [...config.trainers];
    updated[index] = { ...updated[index], [field]: value };
    setConfig((prev) => ({ ...prev, trainers: updated }));
    setIsDirty(true);
  };

  const handleAddTrainer = () => {
    const newTrainer: Trainer = {
      id: `trainer-${Date.now()}`,
      name: 'New Coach',
      title: 'Fitness Coach & Specialist',
      specialties: ['Strength', 'Conditioning'],
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Certified conditioning coach focused on measurable technique and sustainable athletic growth.',
      rate: 85,
      rating: 4.95,
      sessionsCompleted: 140,
    };
    setConfig((prev) => ({ ...prev, trainers: [...prev.trainers, newTrainer] }));
    setIsDirty(true);
  };

  const handleRemoveTrainer = (index: number) => {
    if (config.trainers.length <= 1) return;
    const updated = config.trainers.filter((_, i) => i !== index);
    setConfig((prev) => ({ ...prev, trainers: updated }));
    setIsDirty(true);
  };

  // Class schedule mutations
  const handleUpdateClass = (index: number, field: keyof GymClass, value: any) => {
    const updated = [...config.classes];
    updated[index] = { ...updated[index], [field]: value };
    setConfig((prev) => ({ ...prev, classes: updated }));
    setIsDirty(true);
  };

  const handleAddClass = () => {
    const firstCat = config.scheduleConfig?.categories?.find((c) => c !== 'All') || 'HIIT';
    const newClass: GymClass = {
      id: `class-${Date.now()}`,
      name: 'High Intensity Session',
      time: '6:00 PM',
      duration: '50m',
      instructor: config.trainers[0]?.name || 'Head Coach',
      room: 'Main Studio',
      category: firstCat,
      spotsLeft: 6,
      totalSpots: 18,
      day: 'Mon',
      intensity: 'High',
    };
    setConfig((prev) => ({ ...prev, classes: [...prev.classes, newClass] }));
    setIsDirty(true);
  };

  const handleRemoveClass = (index: number) => {
    if (config.classes.length <= 1) return;
    const updated = config.classes.filter((_, i) => i !== index);
    setConfig((prev) => ({ ...prev, classes: updated }));
    setIsDirty(true);
  };

  // Reward vouchers mutations
  const handleUpdateReward = (index: number, field: keyof RewardTier, value: any) => {
    const updated = [...config.rewards];
    updated[index] = { ...updated[index], [field]: value };
    setConfig((prev) => ({ ...prev, rewards: updated }));
    setIsDirty(true);
  };

  const handleAddReward = () => {
    const nextStep = (config.rewards.length + 1) * 5;
    const newReward: RewardTier = {
      id: `reward-${Date.now()}`,
      title: 'Free Post-Workout Perk',
      reqWorkouts: nextStep,
      description: 'Redeem at front desk upon completing monthly challenge.',
      unlocked: false,
      code: `PERK-${nextStep}CHECK`,
      icon: 'shake',
    };
    setConfig((prev) => ({ ...prev, rewards: [...prev.rewards, newReward] }));
    setIsDirty(true);
  };

  const handleRemoveReward = (index: number) => {
    if (config.rewards.length <= 1) return;
    const updated = config.rewards.filter((_, i) => i !== index);
    setConfig((prev) => ({ ...prev, rewards: updated }));
    setIsDirty(true);
  };

  // Generate demo link & attach to lead record
  const handleGenerateLink = async () => {
    await handlePublishChanges();
    setIsShareModalOpen(true);
  };

  const BUILDER_TABS: { key: BuilderTab; label: string; icon: any; badge?: string }[] = [
    { key: 'brand', label: 'Brand & Identity', icon: Palette },
    { key: 'home', label: 'Home Screen', icon: Home },
    { key: 'schedule', label: 'Schedule', icon: Calendar, badge: `${config.classes.length}` },
    { key: 'trainers', label: 'Trainers & PT', icon: Users, badge: `${config.trainers.length}` },
    { key: 'rewards', label: 'Rewards & Loyalty', icon: Gift, badge: `${config.rewards.length}` },
    { key: 'settings', label: 'Toggles & Push', icon: CheckSquare },
  ];

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

        {/* Action Buttons: Publish Changes + Live View + Proposal Pitch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Indicator */}
          {isDirty ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Unsaved Edits</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Published ✓</span>
            </span>
          )}

          {/* Primary "Publish Changes" Button */}
          <button
            onClick={handlePublishChanges}
            disabled={isPublishing}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-xl active:scale-95 ${
              isPublishing
                ? 'bg-slate-700 text-slate-300 cursor-wait'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/40 shadow-emerald-950/50'
            }`}
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing App...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Changes</span>
              </>
            )}
          </button>

          {/* Live Prospect View */}
          <Link
            href={buildShareableDemoUrl(config)}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition"
          >
            <span>Live App View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Generate / Email Proposal Modal */}
          <button
            onClick={handleGenerateLink}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition border border-white/10"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Email Proposal Pitch</span>
          </button>
        </div>
      </div>

      {/* Published Success Banner */}
      {publishFeedback && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{publishFeedback}</span>
          </div>
          <Link
            href={buildShareableDemoUrl(config)}
            target="_blank"
            className="flex items-center gap-1 text-xs text-white bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition"
          >
            <span>View Live /demo/{config.slug}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Active Prototype Switcher Bar */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
            Active Prototype:
          </span>
          <select
            value={config.slug}
            onChange={(e) => handleSwitchApp(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {availableDemos.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} (/demo/{d.slug})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleStartNewDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition hover:border-emerald-500/40"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>+ Build New Gym Proposal</span>
        </button>
      </div>

      {/* Lead Integration Banner */}
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
        {/* LEFT COLUMN: Section-Based Configuration Tabs */}
        <div
          className={`lg:col-span-7 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 ${
            mobileViewMode === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Section Selector Tab Pills */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-white/10 overflow-x-auto no-scrollbar shadow-lg">
            {BUILDER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeBuilderTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveBuilderTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-md ring-1 ring-white/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Brand & Presets */}
          {activeBuilderTab === 'brand' && (
            <div className="space-y-4">
              {/* Presets Card */}
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
                      type="button"
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

              {/* Identity & Aesthetics */}
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
                      onChange={(e) => {
                        setConfig({ ...config, location: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="e.g. Austin, TX (Downtown)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Industry Studio Type
                    </label>
                    <select
                      value={config.industryType}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          industryType: e.target.value as any,
                        });
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Athletic Club">Athletic Club</option>
                      <option value="CrossFit Box">CrossFit Box</option>
                      <option value="Pilates & Yoga">Pilates & Yoga</option>
                      <option value="Boxing & HIIT">Boxing & HIIT</option>
                    </select>
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
                        onChange={(e) => {
                          setConfig({ ...config, logoMonogram: e.target.value.toUpperCase() });
                          setIsDirty(true);
                        }}
                        placeholder="APEX"
                        className="w-24 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-slate-400">
                        Header badge & app icon monogram
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Unique Demo Slug
                    </label>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-slate-400 font-mono">
                      <span>/demo/</span>
                      <input
                        type="text"
                        value={config.slug}
                        onChange={(e) => {
                          setConfig({ ...config, slug: e.target.value });
                          setIsDirty(true);
                        }}
                        className="flex-1 bg-transparent text-white outline-none"
                      />
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
                        onClick={() => {
                          setConfig({ ...config, primaryColor: swatch.hex });
                          setIsDirty(true);
                        }}
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

                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800 border border-white/10">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => {
                          setConfig({ ...config, primaryColor: e.target.value });
                          setIsDirty(true);
                        }}
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
                        onClick={() => {
                          setConfig({ ...config, isDarkMode: true });
                          setIsDirty(true);
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                          config.isDarkMode ? 'bg-slate-700 text-white' : 'text-slate-400'
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfig({ ...config, isDarkMode: false });
                          setIsDirty(true);
                        }}
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
            </div>
          )}

          {/* TAB 2: Home Screen Settings */}
          {activeBuilderTab === 'home' && (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Home Screen Section Editor</h3>
                    <p className="text-[11px] text-slate-400">
                      Customize greetings, membership titles, and quick action labels
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                  Live Preview
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Member Welcome Greeting
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.greeting || ''}
                    onChange={(e) => handleUpdateHomeConfig('greeting', e.target.value)}
                    placeholder="e.g. Welcome back, Alex!"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Displays on the top left of the member home dashboard.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Member Status / VIP Badge
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.memberBadge || ''}
                    onChange={(e) => handleUpdateHomeConfig('memberBadge', e.target.value)}
                    placeholder="e.g. VIP Member or RX Athlete"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pill badge highlighted in primary brand color.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Activity Card Title
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.membershipCardTitle || ''}
                    onChange={(e) => handleUpdateHomeConfig('membershipCardTitle', e.target.value)}
                    placeholder="e.g. Monthly Attendance or WOD Progress"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Header of the attendance/consistency summary card.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Featured Class Tag
                  </label>
                  <input
                    type="text"
                    value={config.homeConfig?.featuredClassBadge || ''}
                    onChange={(e) => handleUpdateHomeConfig('featuredClassBadge', e.target.value)}
                    placeholder="e.g. Up Next Today or Next Heat"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tag badge displayed on top of the featured workout card.
                  </span>
                </div>
              </div>

              {/* Quick Action Button Labels */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-slate-200">
                  Quick Action Shortcut Buttons (Home Screen 3-Grid)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Button 1 (Calendar)
                    </label>
                    <input
                      type="text"
                      value={config.homeConfig?.quickAction1Label || ''}
                      onChange={(e) =>
                        handleUpdateHomeConfig('quickAction1Label', e.target.value)
                      }
                      placeholder="Book Class"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Button 2 (Turnstile QR)
                    </label>
                    <input
                      type="text"
                      value={config.homeConfig?.quickAction2Label || ''}
                      onChange={(e) =>
                        handleUpdateHomeConfig('quickAction2Label', e.target.value)
                      }
                      placeholder="Scan Pass"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Button 3 (Streak / Fire)
                    </label>
                    <input
                      type="text"
                      value={config.homeConfig?.quickAction3Label || ''}
                      onChange={(e) =>
                        handleUpdateHomeConfig('quickAction3Label', e.target.value)
                      }
                      placeholder="Streak"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Schedule & Classes */}
          {activeBuilderTab === 'schedule' && (
            <div className="space-y-4">
              {/* Schedule Section Header Settings */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Schedule Section Headers</h3>
                    <p className="text-[11px] text-slate-400">
                      Adapt titles and booking copy to CrossFit, Pilates, Boxing, or Athletic Clubs
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Schedule Screen Title
                    </label>
                    <input
                      type="text"
                      value={config.scheduleConfig?.title || ''}
                      onChange={(e) => handleUpdateScheduleConfig('title', e.target.value)}
                      placeholder="e.g. Live Class Schedule or Daily WOD Lineup"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Schedule Subtitle
                    </label>
                    <input
                      type="text"
                      value={config.scheduleConfig?.subtitle || ''}
                      onChange={(e) => handleUpdateScheduleConfig('subtitle', e.target.value)}
                      placeholder="e.g. Book your workout slot in real time"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Booking Confirmation Toast Message
                    </label>
                    <input
                      type="text"
                      value={config.scheduleConfig?.confirmationToast || ''}
                      onChange={(e) =>
                        handleUpdateScheduleConfig('confirmationToast', e.target.value)
                      }
                      placeholder="e.g. You're booked! Added to Apple Calendar ✓"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Dynamic Category Pills */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Category Filter Pills
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(config.scheduleConfig?.categories || []).map((cat) => (
                      <span
                        key={cat}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-white text-xs"
                      >
                        <span>{cat}</span>
                        {cat !== 'All' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat)}
                            className="text-slate-400 hover:text-red-400 transition"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Category Input */}
                  <div className="flex items-center gap-2 pt-1 max-w-sm">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                      placeholder="New category (e.g. Reformer, WOD, Spin)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Class Lineup Editor */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      Class Roster ({config.classes.length})
                    </h3>
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
                            className="text-slate-400 hover:text-red-400 p-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Class Name
                          </label>
                          <input
                            type="text"
                            value={cls.name}
                            onChange={(e) => handleUpdateClass(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Category
                          </label>
                          <input
                            type="text"
                            value={cls.category}
                            onChange={(e) => handleUpdateClass(idx, 'category', e.target.value)}
                            placeholder="e.g. HIIT, Strength"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Day
                          </label>
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
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Start Time
                          </label>
                          <input
                            type="text"
                            value={cls.time}
                            onChange={(e) => handleUpdateClass(idx, 'time', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={cls.duration}
                            onChange={(e) => handleUpdateClass(idx, 'duration', e.target.value)}
                            placeholder="45m"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Instructor
                          </label>
                          <input
                            type="text"
                            value={cls.instructor}
                            onChange={(e) => handleUpdateClass(idx, 'instructor', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Room / Studio
                          </label>
                          <input
                            type="text"
                            value={cls.room}
                            onChange={(e) => handleUpdateClass(idx, 'room', e.target.value)}
                            placeholder="Main Studio"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Open Spots
                          </label>
                          <input
                            type="number"
                            value={cls.spotsLeft}
                            onChange={(e) =>
                              handleUpdateClass(idx, 'spotsLeft', Number(e.target.value) || 0)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Total Spots
                          </label>
                          <input
                            type="number"
                            value={cls.totalSpots}
                            onChange={(e) =>
                              handleUpdateClass(idx, 'totalSpots', Number(e.target.value) || 0)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Intensity
                          </label>
                          <select
                            value={cls.intensity}
                            onChange={(e) =>
                              handleUpdateClass(idx, 'intensity', e.target.value as any)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          >
                            <option value="All Levels">All Levels</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Extreme">Extreme</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Trainers & PT */}
          {activeBuilderTab === 'trainers' && (
            <div className="space-y-4">
              {/* Trainers Header Config */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Trainers Section Headers</h3>
                    <p className="text-[11px] text-slate-400">
                      Customize section title and description to fit gym coaching styles
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Screen Title
                    </label>
                    <input
                      type="text"
                      value={config.trainersConfig?.title || ''}
                      onChange={(e) => handleUpdateTrainersConfig('title', e.target.value)}
                      placeholder="e.g. Coaches & Trainers"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Screen Subtitle
                    </label>
                    <input
                      type="text"
                      value={config.trainersConfig?.subtitle || ''}
                      onChange={(e) => handleUpdateTrainersConfig('subtitle', e.target.value)}
                      placeholder="e.g. 1-on-1 private coaching & assessments"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Trainer Roster List */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      Trainer Roster ({config.trainers.length})
                    </h3>
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

                <div className="space-y-4">
                  {config.trainers.map((trainer, idx) => (
                    <div
                      key={trainer.id || idx}
                      className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={trainer.avatar}
                            alt={trainer.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                          />
                          <span className="text-xs font-bold text-emerald-400">
                            Coach #{idx + 1}: {trainer.name}
                          </span>
                        </div>
                        {config.trainers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTrainer(idx)}
                            className="text-slate-400 hover:text-red-400 p-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={trainer.name}
                            onChange={(e) => handleUpdateTrainer(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Title / Specialty Role
                          </label>
                          <input
                            type="text"
                            value={trainer.title}
                            onChange={(e) => handleUpdateTrainer(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Rate ($/hr)
                          </label>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Avatar Image URL
                          </label>
                          <input
                            type="text"
                            value={trainer.avatar}
                            onChange={(e) => handleUpdateTrainer(idx, 'avatar', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs truncate"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Specialties (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={trainer.specialties.join(', ')}
                            onChange={(e) =>
                              handleUpdateTrainer(
                                idx,
                                'specialties',
                                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                              )
                            }
                            placeholder="Strength, Mobility, WOD"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block">
                          Bio & Philosophy
                        </label>
                        <textarea
                          rows={2}
                          value={trainer.bio}
                          onChange={(e) => handleUpdateTrainer(idx, 'bio', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Rewards & Loyalty */}
          {activeBuilderTab === 'rewards' && (
            <div className="space-y-4">
              {/* Rewards Section Headers & Rules */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Rewards Section & Loyalty Pass</h3>
                    <p className="text-[11px] text-slate-400">
                      Control digital punch card passport, workout goals, and tier badges
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Screen Title
                    </label>
                    <input
                      type="text"
                      value={config.rewardsConfig?.title || ''}
                      onChange={(e) => handleUpdateRewardsConfig('title', e.target.value)}
                      placeholder="e.g. Member Rewards or WOD Passport"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Screen Subtitle
                    </label>
                    <input
                      type="text"
                      value={config.rewardsConfig?.subtitle || ''}
                      onChange={(e) => handleUpdateRewardsConfig('subtitle', e.target.value)}
                      placeholder="e.g. Punch card, streaks & member perks"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Member Tier Badge Name
                    </label>
                    <input
                      type="text"
                      value={config.rewardsConfig?.tierBadge || ''}
                      onChange={(e) => handleUpdateRewardsConfig('tierBadge', e.target.value)}
                      placeholder="e.g. Tier 2 Athlete or RX Athlete"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Monthly Workout Goal (Target)
                    </label>
                    <input
                      type="number"
                      value={config.rewardsConfig?.monthlyGoal || 20}
                      onChange={(e) =>
                        handleUpdateRewardsConfig('monthlyGoal', Number(e.target.value) || 20)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Initial Starting Streak (Days)
                    </label>
                    <input
                      type="number"
                      value={config.rewardsConfig?.startingStreak ?? 14}
                      onChange={(e) =>
                        handleUpdateRewardsConfig('startingStreak', Number(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Controls the simulated streak counter in the live demo.
                    </span>
                  </div>
                </div>
              </div>

              {/* Reward Vouchers List */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      Reward Vouchers & Perks ({config.rewards.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddReward}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Voucher</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {config.rewards.map((reward, idx) => (
                    <div
                      key={reward.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">
                          Reward #{idx + 1}: {reward.title}
                        </span>
                        {config.rewards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReward(idx)}
                            className="text-slate-400 hover:text-red-400 p-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Voucher Title
                          </label>
                          <input
                            type="text"
                            value={reward.title}
                            onChange={(e) => handleUpdateReward(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Workouts Required
                          </label>
                          <input
                            type="number"
                            value={reward.reqWorkouts}
                            onChange={(e) =>
                              handleUpdateReward(idx, 'reqWorkouts', Number(e.target.value) || 0)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Redemption Barcode / Promo Code
                          </label>
                          <input
                            type="text"
                            value={reward.code}
                            onChange={(e) =>
                              handleUpdateReward(idx, 'code', e.target.value.toUpperCase())
                            }
                            placeholder="FREE-SHAKE-5"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs font-mono uppercase"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">
                            Perk Icon Type
                          </label>
                          <select
                            value={reward.icon}
                            onChange={(e) =>
                              handleUpdateReward(idx, 'icon', e.target.value as any)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                          >
                            <option value="shake">Protein Shake</option>
                            <option value="discount">Store Discount %</option>
                            <option value="towel">Branded Merch / Towel</option>
                            <option value="pt">1-on-1 PT Session</option>
                            <option value="trophy">Trophy / Milestone</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block">
                          Redemption Description
                        </label>
                        <input
                          type="text"
                          value={reward.description}
                          onChange={(e) => handleUpdateReward(idx, 'description', e.target.value)}
                          placeholder="e.g. Redeem at front desk smoothie bar"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Feature Toggles & Push Alert */}
          {activeBuilderTab === 'settings' && (
            <div className="space-y-4">
              {/* Feature Toggles */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Modular Feature Switches</h3>
                    <p className="text-[11px] text-slate-400">
                      Enable or disable features to match client package levels
                    </p>
                  </div>
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
                      desc: 'Smooth drop-down banner after 3.2 seconds',
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
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              features: {
                                ...config.features,
                                [feat.key]: e.target.checked,
                              },
                            });
                            setIsDirty(true);
                          }}
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
                  <div>
                    <h3 className="text-sm font-bold text-white">Push Notification Text</h3>
                    <p className="text-[11px] text-slate-400">
                      Appears on the simulated iPhone screen to impress prospects
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Simulated Lock Screen Alert Copy
                  </label>
                  <textarea
                    rows={2}
                    value={
                      config.customPushMessage ||
                      `🔥 ${config.name} Reminder: 2 spots left for 6:00 PM workout tonight! Tap to reserve.`
                    }
                    onChange={(e) => {
                      setConfig({ ...config, customPushMessage: e.target.value });
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
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
              Auto-syncs to tab
            </span>
          </div>

          {/* The Phone Chassis with active tab override */}
          <div className="relative">
            <PhoneFrame
              config={config}
              activeTabOverride={phoneTabMapping[activeBuilderTab]}
            />
          </div>

          <div className="mt-4 text-center w-full max-w-sm space-y-2">
            <button
              onClick={handlePublishChanges}
              disabled={isPublishing}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs text-slate-950 flex items-center justify-center gap-2 shadow-xl hover:brightness-105 transition active:scale-98 ${
                isPublishing ? 'bg-slate-700 text-slate-300 cursor-wait' : 'bg-emerald-400 hover:bg-emerald-300'
              }`}
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Changes to Live App</span>
                </>
              )}
            </button>

            <button
              onClick={handleGenerateLink}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-2 border border-white/10 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Email Proposal Pitch & QR (/demo/{config.slug})</span>
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
