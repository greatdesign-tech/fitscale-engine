import fs from 'fs';
import path from 'path';
import os from 'os';
import { GymLead } from '@/types';
import { INITIAL_LEADS } from './leadStore';

// Global memory cache to prevent loss across warm serverless invocations
const globalForLeads = globalThis as unknown as {
  __fitscale_leads_cache?: Map<string, GymLead>;
};
const memoryCache = globalForLeads.__fitscale_leads_cache || new Map<string, GymLead>();
globalForLeads.__fitscale_leads_cache = memoryCache;

const PRIMARY_DATA_DIR = path.join(process.cwd(), 'data');
const PRIMARY_FILE = path.join(PRIMARY_DATA_DIR, 'leads.json');
const TMP_FILE = path.join(os.tmpdir(), 'fitscale-leads.json');

function readFromPath(filePath: string): Record<string, GymLead> {
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

function readAllDiskLeads(): Record<string, GymLead> {
  const primary = readFromPath(PRIMARY_FILE);
  const tmp = readFromPath(TMP_FILE);
  return { ...primary, ...tmp };
}

function writeToDisk(leads: Record<string, GymLead>) {
  const jsonStr = JSON.stringify(leads, null, 2);

  // Try writing to primary data directory
  try {
    if (!fs.existsSync(PRIMARY_DATA_DIR)) {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, jsonStr, 'utf-8');
    return;
  } catch (e) {
    // Read-only filesystem on Vercel or permission error; fall back to tmp
  }

  // Fallback to os tmpdir for serverless environments
  try {
    fs.writeFileSync(TMP_FILE, jsonStr, 'utf-8');
  } catch (e) {
    console.warn('Server disk write fallback failed; stored in memory cache', e);
  }
}

export function getAllServerLeads(): GymLead[] {
  const diskLeads = readAllDiskLeads();
  const result: Record<string, GymLead> = {};

  // Baseline initial leads
  INITIAL_LEADS.forEach((lead) => {
    result[lead.id] = lead;
  });

  // Override / append with disk leads
  Object.entries(diskLeads).forEach(([id, lead]) => {
    result[id] = lead;
  });

  // Override / append with active memory cache
  Array.from(memoryCache.entries()).forEach(([id, lead]) => {
    result[id] = lead;
  });

  return Object.values(result);
}

export function getServerLeadById(id: string): GymLead | null {
  // 1. Memory cache
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }

  // 2. Disk
  const diskLeads = readAllDiskLeads();
  if (diskLeads[id]) {
    memoryCache.set(id, diskLeads[id]);
    return diskLeads[id];
  }

  // 3. Initial baseline
  const initial = INITIAL_LEADS.find((l) => l.id === id);
  if (initial) {
    return initial;
  }

  return null;
}

export function saveServerLead(lead: GymLead): GymLead {
  memoryCache.set(lead.id, lead);

  const diskLeads = readAllDiskLeads();
  diskLeads[lead.id] = lead;
  writeToDisk(diskLeads);

  return lead;
}

export function attachServerDemoToLead(
  leadId: string,
  demoSlug: string,
  demoUrl: string
): GymLead | null {
  const lead = getServerLeadById(leadId);
  if (!lead) return null;

  const updated: GymLead = {
    ...lead,
    demoSlug,
    demoUrl,
    appStatus: 'demo_ready',
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  return saveServerLead(updated);
}
