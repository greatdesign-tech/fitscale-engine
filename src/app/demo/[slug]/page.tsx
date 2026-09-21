'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PRESET_DEMOS } from '@/lib/defaultDemos';
import { getDemoBySlug } from '@/lib/store';
import { GymConfig } from '@/types';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { AgencyHeader } from '@/components/prospect/AgencyHeader';
import { FloatingAgencyCta } from '@/components/prospect/FloatingAgencyCta';
import { StrategyCallModal } from '@/components/prospect/StrategyCallModal';
import { QrShareModal } from '@/components/prospect/QrShareModal';
import { Smartphone, Sparkles, RefreshCw, Calendar, ArrowRight, Mail } from 'lucide-react';

export default function DemoViewerPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'apex-fitness';

  const [config, setConfig] = useState<GymConfig>(
    PRESET_DEMOS[slug] || PRESET_DEMOS['apex-fitness']
  );
  const [pushTriggerKey, setPushTriggerKey] = useState(0);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to load from store or API
    const found = getDemoBySlug(slug);
    if (found) {
      setConfig(found);
      setIsLoading(false);
    } else {
      // Fetch via API
      fetch(`/api/demos/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setConfig(data.data);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [slug]);

  const handleTriggerPush = () => {
    setPushTriggerKey((prev) => prev + 1);
  };

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
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mb-1">
            Custom App Concept for {config.name}
          </span>
          <h2 className="text-base font-bold text-white">
            Experience Your Gym&apos;s Mobile Prototype
          </h2>
          <button
            onClick={() => setIsStrategyModalOpen(true)}
            className="mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5 shadow-lg"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Get App Proposal & Specs via Email</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
