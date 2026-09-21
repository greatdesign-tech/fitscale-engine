import fs from 'fs';
import path from 'path';
import { GymConfig } from '@/types';
import { PRESET_DEMOS } from './defaultDemos';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEMOS_FILE = path.join(DATA_DIR, 'demos.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error('Failed to create data directory', e);
    }
  }
}

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

function readDemosFromDisk(): Record<string, GymConfig> {
  ensureDataDir();
  if (!fs.existsSync(DEMOS_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(DEMOS_FILE, 'utf-8');
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    console.error('Error reading demos.json from disk', e);
    return {};
  }
}

function writeDemosToDisk(demos: Record<string, GymConfig>) {
  ensureDataDir();
  try {
    fs.writeFileSync(DEMOS_FILE, JSON.stringify(demos, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing demos.json to disk', e);
  }
}

export function getServerDemoBySlug(slug: string): GymConfig | null {
  // 1. Check disk file first (published custom configs take priority over default presets)
  const diskDemos = readDemosFromDisk();
  if (diskDemos[slug]) {
    return sanitizeDemoConfig(diskDemos[slug]);
  }

  // 2. Fallback to default preset dictionary
  if (PRESET_DEMOS[slug]) {
    return sanitizeDemoConfig(PRESET_DEMOS[slug]);
  }

  return null;
}

export function saveServerDemo(config: GymConfig): GymConfig {
  const sanitized = sanitizeDemoConfig(config);
  const diskDemos = readDemosFromDisk();
  diskDemos[sanitized.slug] = sanitized;
  writeDemosToDisk(diskDemos);
  return sanitized;
}

export function getAllServerDemos(): GymConfig[] {
  const diskDemos = readDemosFromDisk();
  const result: Record<string, GymConfig> = {};

  // Start with preset demos
  Object.entries(PRESET_DEMOS).forEach(([slug, cfg]) => {
    result[slug] = sanitizeDemoConfig(cfg);
  });

  // Override / append with disk demos
  Object.entries(diskDemos).forEach(([slug, cfg]) => {
    result[slug] = sanitizeDemoConfig(cfg);
  });

  return Object.values(result);
}
