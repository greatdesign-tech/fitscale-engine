import { GymConfig } from '@/types';
import { PRESET_DEMOS } from './defaultDemos';

const STORAGE_KEY = 'fitapp_demos_custom_v1';

// In-memory cache for fast SSR / API route retrieval
const memoryCache: Map<string, GymConfig> = new Map();

// Initialize memory cache with preset demos
Object.entries(PRESET_DEMOS).forEach(([slug, config]) => {
  memoryCache.set(slug, config);
});

function sanitizeDemoConfig(cfg: GymConfig): GymConfig {
  if (cfg.agencySettings) {
    if (!cfg.agencySettings.repName || cfg.agencySettings.repName === 'Marcus Vance') {
      cfg.agencySettings.repName = 'Taiwo Adediji';
    }
    if (!cfg.agencySettings.repEmail || cfg.agencySettings.repEmail === 'marcus@fitdigitalapps.io') {
      cfg.agencySettings.repEmail = 'taiwo.adediji.apps@gmail.com';
    }
  }
  return cfg;
}

export function getDemoBySlug(slug: string): GymConfig | null {
  // Check memory cache first
  if (memoryCache.has(slug)) {
    return sanitizeDemoConfig(memoryCache.get(slug)!);
  }

  // Check preset dictionary
  if (PRESET_DEMOS[slug]) {
    return sanitizeDemoConfig(PRESET_DEMOS[slug]);
  }

  // Client-side localStorage fallback
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const list: GymConfig[] = JSON.parse(saved);
        const found = list.find((item) => item.slug === slug);
        if (found) {
          const sanitized = sanitizeDemoConfig(found);
          memoryCache.set(slug, sanitized);
          return sanitized;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
  }

  return null;
}

export function saveDemo(config: GymConfig): GymConfig {
  memoryCache.set(config.slug, config);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let list: GymConfig[] = saved ? JSON.parse(saved) : [];
      const index = list.findIndex((item) => item.slug === config.slug);
      if (index >= 0) {
        list[index] = config;
      } else {
        list.unshift(config);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  return config;
}

export function getAllDemos(): GymConfig[] {
  const all: GymConfig[] = Object.values(PRESET_DEMOS).map(sanitizeDemoConfig);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const custom: GymConfig[] = JSON.parse(saved);
        // Combine without duplicates
        const customFiltered = custom
          .filter((c) => !all.some((p) => p.slug === c.slug))
          .map(sanitizeDemoConfig);
        return [...customFiltered, ...all];
      }
    } catch (e) {
      console.error('Error fetching demos', e);
    }
  }

  return all;
}
