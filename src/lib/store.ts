import { GymConfig } from '@/types';
import { PRESET_DEMOS } from './defaultDemos';

const STORAGE_KEY = 'fitapp_demos_custom_v1';

// In-memory cache for fast retrieval
const memoryCache: Map<string, GymConfig> = new Map();

export function sanitizeDemoConfig(cfg: GymConfig): GymConfig {
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
  // 1. Client-side localStorage MUST be checked FIRST so published edits always take precedence
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

  // 2. Check memory cache (e.g. from recent saves)
  if (memoryCache.has(slug)) {
    return sanitizeDemoConfig(memoryCache.get(slug)!);
  }

  // 3. Fallback to preset dictionary
  if (PRESET_DEMOS[slug]) {
    const preset = sanitizeDemoConfig(PRESET_DEMOS[slug]);
    memoryCache.set(slug, preset);
    return preset;
  }

  return null;
}

export function saveDemo(config: GymConfig): GymConfig {
  const sanitized = sanitizeDemoConfig(config);
  memoryCache.set(sanitized.slug, sanitized);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let list: GymConfig[] = saved ? JSON.parse(saved) : [];
      const index = list.findIndex((item) => item.slug === sanitized.slug);
      if (index >= 0) {
        list[index] = sanitized;
      } else {
        list.unshift(sanitized);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }

    // Persist to server disk via API
    fetch('/api/demos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    }).catch((err) => console.error('Server sync error', err));
  }

  return sanitized;
}

export async function publishDemo(config: GymConfig): Promise<GymConfig> {
  const sanitized = sanitizeDemoConfig(config);
  memoryCache.set(sanitized.slug, sanitized);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let list: GymConfig[] = saved ? JSON.parse(saved) : [];
      const index = list.findIndex((item) => item.slug === sanitized.slug);
      if (index >= 0) {
        list[index] = sanitized;
      } else {
        list.unshift(sanitized);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }

    // Await server persistence
    try {
      const res = await fetch('/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized),
      });
      const data = await res.json();
      if (data.success && data.data) {
        return sanitizeDemoConfig(data.data);
      }
    } catch (err) {
      console.error('Server publish error', err);
    }
  }

  return sanitized;
}

export function getAllDemos(): GymConfig[] {
  let customList: GymConfig[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        customList = JSON.parse(saved).map(sanitizeDemoConfig);
      }
    } catch (e) {
      console.error('Error fetching demos', e);
    }
  }

  // Presets that haven't been customized
  const presetList: GymConfig[] = Object.values(PRESET_DEMOS)
    .map(sanitizeDemoConfig)
    .filter((preset) => !customList.some((c) => c.slug === preset.slug));

  return [...customList, ...presetList];
}
