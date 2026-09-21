'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Mail,
  QrCode,
  Sparkles,
  Share2,
  Send,
} from 'lucide-react';
import QRCode from 'qrcode';
import { GymConfig } from '@/types';
import { buildShareableDemoUrl } from '@/lib/demoUrlEncoder';

interface ShareModalProps {
  config: GymConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  config,
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'link' | 'email'>('link');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const demoUrl = buildShareableDemoUrl(config, origin);

  useEffect(() => {
    if (isOpen && demoUrl) {
      QRCode.toDataURL(
        demoUrl,
        {
          width: 200,
          margin: 1.5,
          color: { dark: '#0f172a', light: '#ffffff' },
        },
        (err, url) => {
          if (!err && url) setQrDataUrl(url);
        }
      );
    }
  }, [isOpen, demoUrl]);

  const emailPitch = `Subject: Quick interactive app prototype for ${config.name} 📱

Hi [First Name],

I was checking out ${config.name} in ${config.location} and noticed your members don't have a dedicated, custom-branded iOS & Android app yet for booking classes and tracking workout streaks.

Rather than sending a generic pitch deck, our agency built a realistic, interactive mobile app concept tailored specifically for ${config.name}:

👉 Test the interactive demo here:
${demoUrl}

(You can tap through the live class schedule, 1-on-1 PT bookings, and digital loyalty punch card right in your browser or on your phone).

If you'd like to review the full app specifications, rollout timeline, and pricing for ${config.name}, just reply directly to this email—no sales calls required, we coordinate everything conveniently over email.

Best regards,
${config.agencySettings.repName}
${config.agencySettings.repTitle}
${config.agencySettings.agencyName}
${config.agencySettings.repEmail}`;

  const copyToClipboard = (text: string, isEmail = false) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      if (isEmail) {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2200);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl relative"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Prospect Link Ready
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              Share Demo with {config.name}
            </h3>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              Your custom prospect demo is live and ready for cold outreach, emails, or live sales calls.
            </p>

            {/* Tab switch: Link vs Email Pitch */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <button
                onClick={() => setActiveTab('link')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'link'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Demo Link & QR</span>
              </button>

              <button
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'email'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Cold Outreach Email Pitch</span>
              </button>
            </div>

            {activeTab === 'link' ? (
              <div className="space-y-4">
                {/* Link Bar */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Clean Public URL
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-white/10">
                    <input
                      readOnly
                      value={demoUrl}
                      className="flex-1 bg-transparent text-xs text-white font-mono px-2 outline-none truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(demoUrl, false)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1.5 transition shadow-sm hover:brightness-105"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {/* QR preview & Action buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                  {qrDataUrl && (
                    <div className="bg-white p-2 rounded-xl shrink-0">
                      <img src={qrDataUrl} alt="Demo QR" className="w-24 h-24 rounded-md" />
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-white">Live Phone Preview</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Owners can scan this QR code directly to experience the demo natively on their device.
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <a
                        href={demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <span>Open Live Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Pre-Written Cold Email Template
                  </label>
                  <button
                    onClick={() => copyToClipboard(emailPitch, true)}
                    className="text-xs font-bold px-3 py-1 rounded-lg text-slate-950 flex items-center gap-1 transition"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Pitch Email'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-white/10 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {emailPitch}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
