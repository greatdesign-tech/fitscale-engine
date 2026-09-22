'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PRESET_DEMOS, ensureGymConfig } from '@/lib/defaultDemos';
import { getCustomLocalDemoBySlug, getDemoBySlug, saveDemo } from '@/lib/store';
import { decodeDemoConfig } from '@/lib/demoUrlEncoder';
import { GymConfig } from '@/types';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { AgencyHeader } from '@/components/prospect/AgencyHeader';
import { FloatingAgencyCta } from '@/components/prospect/FloatingAgencyCta';
import { StrategyCallModal } from '@/components/prospect/StrategyCallModal';
import { QrShareModal } from '@/components/prospect/QrShareModal';
import { Smartphone, RefreshCw, ArrowRight, AlertCircle, Lock } from 'lucide-react';

export default function DemoViewerPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'apex-fitness';

  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<GymConfig | null>(() => {
    // Only use static presets on initial render to guarantee SSR/Client match
    if (PRESET_DEMOS[slug]) {
      return ensureGymConfig(PRESET_DEMOS[slug]);
    }
    return null;
  });

  const [pushTriggerKey, setPushTriggerKey] = useState(0);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isCancelled = false;

    // 1. Check URL payload (?c=...)
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const payload = urlParams.get('c');
        if (payload) {
          const decoded = decodeDemoConfig(payload);
          if (decoded) {
            const safe = ensureGymConfig(decoded);
            setConfig(safe);
            setIsLoading(false);
            setNotFound(false);
            // Save to this browser's local storage & sync to server API
            saveDemo(safe);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Could not decode URL payload', err);
    }

    // 2. Immediate local cache preview (prevents layout jump while fetching)
    const localCustom = getCustomLocalDemoBySlug(slug);
    if (localCustom) {
      setConfig(ensureGymConfig(localCustom));
      setIsLoading(false);
      setNotFound(false);
    } else if (PRESET_DEMOS[slug]) {
      setConfig(ensureGymConfig(PRESET_DEMOS[slug]));
      setIsLoading(false);
      setNotFound(false);
    }

    // 3. Always fetch authoritative published version from server API
    fetch(`/api/demos/${slug}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.success && data.data) {
          const safe = ensureGymConfig(data.data);
          setConfig(safe);
          saveDemo(safe);
          setIsLoading(false);
          setNotFound(false);
        } else {
          // Server returned false or 404
          if (localCustom) {
            setConfig(ensureGymConfig(localCustom));
            setIsLoading(false);
            setNotFound(false);
          } else if (PRESET_DEMOS[slug]) {
            setConfig(ensureGymConfig(PRESET_DEMOS[slug]));
            setIsLoading(false);
            setNotFound(false);
          } else {
            setIsLoading(false);
            setNotFound(true);
          }
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn(`Could not reach server for demo /${slug}, using offline fallback:`, err);
        if (localCustom) {
          setConfig(ensureGymConfig(localCustom));
          setIsLoading(false);
          setNotFound(false);
        } else if (PRESET_DEMOS[slug]) {
          setConfig(ensureGymConfig(PRESET_DEMOS[slug]));
          setIsLoading(false);
          setNotFound(false);
        } else {
          setIsLoading(false);
          setNotFound(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  const handleTriggerPush = () => {
    setPushTriggerKey((prev) => prev + 1);
  };

  // Loading state (prevents hydration mismatch and flashing)
  if (!mounted || isLoading || !config) {
    if (mounted && notFound) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto selection:bg-emerald-500">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-lg border border-amber-500/30">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Prototype Link Pending</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            The customized prototype for <strong className="text-emerald-400 font-mono font-bold">/{slug}</strong> has not been synced to this device yet.
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            If you received a proposal link, please make sure you clicked the full email link or scanned the QR code.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/admin/builder"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg active:scale-98"
            >
              Open Demo Studio
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 animate-pulse">
          <Smartphone className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white tracking-tight">Loading Mobile Prototype...</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">/demo/{slug}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Banner & Agency Navigation */}
      <AgencyHeader
        config={config}
        onTriggerPush={handleTriggerPush}
        onOpenQr={() => setIsQrOpen(true)}
      />

      {/* Main Showcase Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col justify-center">
        {/* Mobile View CTA Header (Only visible on small viewports) */}
        <div className="block lg:hidden mb-4 p-4 rounded-2xl bg-slate-900 border border-white/10 text-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
              ✦ EXCLUSIVE PROPOSAL
            </span>
            <span className="text-[11px] text-slate-400 font-medium">14-Day Launch Guaranteed</span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-white">
            Want this exact mobile app branded for {config.name}?
          </h2>
          <button
            onClick={() => setIsStrategyModalOpen(true)}
            className="mt-3 w-full py-3.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 flex items-center justify-center gap-1.5 shadow-lg bg-orange-500 hover:bg-orange-400 active:scale-98 transition cursor-pointer"
          >
            <span>Get Pricing & 14-Day Launch Blueprint</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
          <p className="text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Delivered instantly to your inbox • No spam</span>
          </p>
        </div>

        {/* Split Showcase Layout: Centered Phone + Floating Right CTA */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 xl:gap-16 py-4">
          {/* Phone Container */}
          <div className="relative flex flex-col items-center">
            {/* Ambient Background Glow behind Phone */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[650px] rounded-full blur-[100px] opacity-25 pointer-events-none -z-10"
              style={{ backgroundColor: config.primaryColor }}
            />

            <PhoneFrame
              key={`${config.slug}-${pushTriggerKey}`}
              config={config}
              allowPushTrigger={true}
            />

            {/* Quick Demo Controls under phone */}
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
              <button
                onClick={handleTriggerPush}
                className="flex items-center gap-1.5 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>Replay Push Drop</span>
              </button>

              <button
                onClick={() => setIsQrOpen(true)}
                className="flex items-center gap-1.5 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5"
              >
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>Scan on iPhone / Android</span>
              </button>
            </div>
          </div>

          {/* Desktop Right Side Floating Conversion Card */}
          <div className="hidden lg:block">
            <FloatingAgencyCta
              config={config}
              onBookCall={() => setIsStrategyModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <StrategyCallModal
        config={config}
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
      />

      <QrShareModal
        config={config}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />
    </div>
  );
}
