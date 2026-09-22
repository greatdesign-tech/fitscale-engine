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

export function getCustomLocalDemoBySlug(slug: string): GymConfig | null {
  // Check ONLY client-side localStorage and memoryCache without falling back to presets
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

  if (memoryCache.has(slug)) {
    return sanitizeDemoConfig(memoryCache.get(slug)!);
  }

  return null;
}

export function getDemoBySlug(slug: string, allowPresetFallback = true): GymConfig | null {
  const local = getCustomLocalDemoBySlug(slug);
  if (local) {
    return local;
  }

  // Fallback to preset dictionary only if explicitly allowed
  if (allowPresetFallback && PRESET_DEMOS[slug]) {
    const preset = sanitizeDemoConfig(PRESET_DEMOS[slug]);
    return preset;
  }

  return null;
}

export async function fetchDemoBySlug(slug: string): Promise<GymConfig | null> {
  // 1. Fetch authoritative version from server API
  try {
    const res = await fetch(`/api/demos/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        const sanitized = sanitizeDemoConfig(data.data);
        memoryCache.set(slug, sanitized);
        // Sync to local storage
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
            // Ignore
          }
        }
        return sanitized;
      }
    }
  } catch (err) {
    console.warn(`Could not fetch demo /api/demos/${slug} from server, checking local cache:`, err);
  }

  // 2. Fallback to local storage
  const local = getCustomLocalDemoBySlug(slug);
  if (local) {
    return local;
  }

  // 3. Fallback to preset
  if (PRESET_DEMOS[slug]) {
    return sanitizeDemoConfig(PRESET_DEMOS[slug]);
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
        const savedServer = sanitizeDemoConfig(data.data);
        memoryCache.set(savedServer.slug, savedServer);
        return savedServer;
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

  // Presets that haven't been customized locally
  const presetList: GymConfig[] = Object.values(PRESET_DEMOS)
    .map(sanitizeDemoConfig)
    .filter((preset) => !customList.some((c) => c.slug === preset.slug));

  return [...customList, ...presetList];
}

export async function fetchAllDemos(): Promise<GymConfig[]> {
  try {
    const res = await fetch('/api/demos', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const serverDemos: GymConfig[] = data.data.map(sanitizeDemoConfig);
        // Sync server custom demos into localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverDemos));
          } catch (e) {
            // Ignore
          }
        }
        return serverDemos;
      }
    }
  } catch (err) {
    console.warn('Could not fetch all demos from server, falling back to local:', err);
  }

  return getAllDemos();
}
