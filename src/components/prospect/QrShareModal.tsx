'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { GymConfig } from '@/types';
import { buildShareableDemoUrl } from '@/lib/demoUrlEncoder';

interface QrShareModalProps {
  config: GymConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const QrShareModal: React.FC<QrShareModalProps> = ({
  config,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = buildShareableDemoUrl(config, window.location.origin);
      setFullUrl(url);

      QRCode.toDataURL(
        url,
        {
          width: 280,
          margin: 1.5,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err, dataUrl) => {
          if (!err && dataUrl) {
            setQrDataUrl(dataUrl);
          }
        }
      );
    }
  }, [config.slug, isOpen]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 mb-2 text-emerald-400 text-xs font-semibold">
              <Smartphone className="w-4 h-4" />
              <span>Real Device Experience</span>
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Test on Your Smartphone
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Point your iPhone or Android camera at the QR code below to experience {config.name}&apos;s mobile prototype full-screen.
            </p>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto mb-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${config.name} demo`}
                  className="w-56 h-56 rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR Code...
                </div>
              )}
            </div>

            {/* URL bar & Copy */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-white/10 mb-3">
              <input
                readOnly
                value={fullUrl}
                className="flex-1 bg-transparent text-xs text-slate-300 outline-none truncate px-1 font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 transition"
            >
              <span>Open in Separate Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
