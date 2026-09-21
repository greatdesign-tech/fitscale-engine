import fs from 'fs';
import path from 'path';
import { GymConfig } from '@/types';
import { PRESET_DEMOS } from './defaultDemos';

// Global memory cache to prevent loss across warm serverless invocations
const globalForDemos = globalThis as unknown as {
  __fitscale_demos_cache?: Map<string, GymConfig>;
};
const memoryCache = globalForDemos.__fitscale_demos_cache || new Map<string, GymConfig>();
globalForDemos.__fitscale_demos_cache = memoryCache;

const PRIMARY_DATA_DIR = path.join(process.cwd(), 'data');
const PRIMARY_FILE = path.join(PRIMARY_DATA_DIR, 'demos.json');
const TMP_FILE = path.join('/tmp', 'fitscale-demos.json');

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

function readFromPath(filePath: string): Record<string, GymConfig> {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
      }
    }
  } catch (e) {
    // Ignore read error
  }
  return {};
}

function readAllDiskDemos(): Record<string, GymConfig> {
  const primary = readFromPath(PRIMARY_FILE);
  const tmp = readFromPath(TMP_FILE);
  return { ...primary, ...tmp };
}

function writeToDisk(demos: Record<string, GymConfig>) {
  const jsonStr = JSON.stringify(demos, null, 2);

  // Try writing to primary data directory
  try {
    if (!fs.existsSync(PRIMARY_DATA_DIR)) {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, jsonStr, 'utf-8');
    return;
  } catch (e) {
    // Read-only filesystem on Vercel or permission error; fall back to /tmp
  }

  // Fallback to /tmp for serverless environments
  try {
    fs.writeFileSync(TMP_FILE, jsonStr, 'utf-8');
  } catch (e) {
    console.warn('Server disk write fallback failed; stored in memory cache', e);
  }
}

export function getServerDemoBySlug(slug: string): GymConfig | null {
  // 1. Check in-memory cache
  if (memoryCache.has(slug)) {
    return sanitizeDemoConfig(memoryCache.get(slug)!);
  }

  // 2. Check disk files (primary & /tmp)
  const diskDemos = readAllDiskDemos();
  if (diskDemos[slug]) {
    const sanitized = sanitizeDemoConfig(diskDemos[slug]);
    memoryCache.set(slug, sanitized);
    return sanitized;
  }

  // 3. Fallback to default preset dictionary
  if (PRESET_DEMOS[slug]) {
    return sanitizeDemoConfig(PRESET_DEMOS[slug]);
  }

  return null;
}

export function saveServerDemo(config: GymConfig): GymConfig {
  const sanitized = sanitizeDemoConfig(config);
  memoryCache.set(sanitized.slug, sanitized);

  const diskDemos = readAllDiskDemos();
  diskDemos[sanitized.slug] = sanitized;
  writeToDisk(diskDemos);

  return sanitized;
}

export function getAllServerDemos(): GymConfig[] {
  const diskDemos = readAllDiskDemos();
  const result: Record<string, GymConfig> = {};

  // Start with preset demos
  Object.entries(PRESET_DEMOS).forEach(([slug, cfg]) => {
    result[slug] = sanitizeDemoConfig(cfg);
  });

  // Override / append with disk demos
  Object.entries(diskDemos).forEach(([slug, cfg]) => {
    result[slug] = sanitizeDemoConfig(cfg);
  });

  // Override / append with active memory cache
  Array.from(memoryCache.entries()).forEach(([slug, cfg]) => {
    result[slug] = sanitizeDemoConfig(cfg);
  });

  return Object.values(result);
}
