import { GymLead, AppStatus } from '@/types';

const LEADS_STORAGE_KEY = 'fitscale_leads_v1';

export const INITIAL_LEADS: GymLead[] = [
  {
    id: 'lead-1',
    name: 'Apex Athletic Club',
    website: 'https://apexathletic.com',
    contactEmail: 'alex@apexathletic.com',
    contactName: 'Alex Rivera (Owner)',
    phone: '+1 (512) 843-9120',
    city: 'Austin',
    state: 'TX',
    studioType: 'Athletic Club',
    appStatus: 'demo_ready',
    demoSlug: 'apex-fitness',
    demoUrl: '/demo/apex-fitness',
    notes: 'Premium athletic facility looking to replace generic web portal.',
    lastUpdated: '2026-09-14',
  },
  {
    id: 'lead-2',
    name: 'IronForge CrossFit Box',
    website: 'https://ironforgecrossfit.com',
    contactEmail: 'dave@ironforgecrossfit.com',
    contactName: 'Dave Miller (Head Coach)',
    phone: '+1 (303) 718-4420',
    city: 'Denver',
    state: 'CO',
    studioType: 'CrossFit Box',
    appStatus: 'demo_ready',
    demoSlug: 'ironforge-crossfit',
    demoUrl: '/demo/ironforge-crossfit',
    notes: 'Needs automated whiteboard WOD booking and streak punch-cards.',
    lastUpdated: '2026-09-14',
  },
  {
    id: 'lead-3',
    name: 'Zenith Pilates & Sanctuary',
    website: 'https://zenithpilatesla.com',
    contactEmail: 'chloe@zenithpilatesla.com',
    contactName: 'Chloe Laurent (Director)',
    phone: '+1 (310) 459-8812',
    city: 'Santa Monica',
    state: 'CA',
    studioType: 'Pilates & Yoga',
    appStatus: 'demo_ready',
    demoSlug: 'zenith-pilates',
    demoUrl: '/demo/zenith-pilates',
    notes: 'Boutique reformer studio with long waitlists. High willingness to pay.',
    lastUpdated: '2026-09-14',
  },
  {
    id: 'lead-4',
    name: 'Rumble Boxing & HIIT Lab',
    website: 'https://rumblehiitmiami.com',
    contactEmail: 'tyson@rumblehiitmiami.com',
    contactName: 'Tyson Ortiz (Founder)',
    phone: '+1 (305) 991-3420',
    city: 'Miami',
    state: 'FL',
    studioType: 'Boxing & HIIT',
    appStatus: 'demo_ready',
    demoSlug: 'rumble-boxing',
    demoUrl: '/demo/rumble-boxing',
    notes: 'Heavy social media presence, members want in-app glove booking & beats.',
    lastUpdated: '2026-09-14',
  },
  {
    id: 'lead-5',
    name: 'Solstice Hot Yoga & Flow',
    website: 'https://solsticeflowaz.com',
    contactEmail: 'claire@solsticeflowaz.com',
    contactName: 'Claire Bennett (Owner)',
    phone: '+1 (480) 332-9011',
    city: 'Scottsdale',
    state: 'AZ',
    studioType: 'Pilates & Yoga',
    appStatus: 'no_app',
    notes: 'Currently using standard paper punch cards. High retention potential with mobile app.',
    lastUpdated: '2026-09-12',
  },
  {
    id: 'lead-6',
    name: 'Barbell Brigade Strength Loft',
    website: 'https://barbellbrigadela.com',
    contactEmail: 'bart@barbellbrigade.com',
    contactName: 'Bart Kwan (General Manager)',
    phone: '+1 (213) 551-8930',
    city: 'Los Angeles',
    state: 'CA',
    studioType: 'Athletic Club',
    appStatus: 'no_app',
    notes: 'Huge creator gym with massive fan base, members begging for custom branded iOS app.',
    lastUpdated: '2026-09-10',
  },
  {
    id: 'lead-7',
    name: 'Brooklyn Iron & Movement',
    website: 'https://brooklynironmovement.com',
    contactEmail: 'marcus@brooklyniron.nyc',
    contactName: 'Marcus Sterling (Partner)',
    phone: '+1 (718) 402-1199',
    city: 'Brooklyn',
    state: 'NY',
    studioType: 'CrossFit Box',
    appStatus: 'third_party_only',
    notes: 'Members currently complain about clunky third-party web browser booking.',
    lastUpdated: '2026-09-08',
  },
  {
    id: 'lead-8',
    name: 'Music City Functional Fitness',
    website: 'https://musiccityfitness.com',
    contactEmail: 'sarah@musiccityfitness.com',
    contactName: 'Sarah Jenkins (Owner)',
    phone: '+1 (615) 882-7711',
    city: 'Nashville',
    state: 'TN',
    studioType: 'Athletic Club',
    appStatus: 'no_app',
    notes: 'Recently expanded to second location in East Nashville. Needs unified mobile tech.',
    lastUpdated: '2026-09-05',
  },
  {
    id: 'lead-9',
    name: 'Windy City Reformer Club',
    website: 'https://windycityreformer.com',
    contactEmail: 'elizabeth@windycityreformer.com',
    contactName: 'Elizabeth Walsh (Director)',
    phone: '+1 (312) 604-5510',
    city: 'Chicago',
    state: 'IL',
    studioType: 'Pilates & Yoga',
    appStatus: 'no_app',
    notes: 'Losing morning class bookings due to lack of push notification reminders.',
    lastUpdated: '2026-09-01',
  },
];

// Memory cache for SSR / API routes
const leadsCache: Map<string, GymLead> = new Map();
INITIAL_LEADS.forEach((lead) => leadsCache.set(lead.id, lead));

export function getAllLeads(): GymLead[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LEADS_STORAGE_KEY);
      if (saved) {
        const parsed: GymLead[] = JSON.parse(saved);
        parsed.forEach((l) => leadsCache.set(l.id, l));
        return parsed;
      }
    } catch (e) {
      console.error('Error reading leads from localStorage', e);
    }
  }

  return Array.from(leadsCache.values());
}

export function getLeadById(id: string): GymLead | null {
  if (leadsCache.has(id)) {
    return leadsCache.get(id)!;
  }
  const all = getAllLeads();
  return all.find((l) => l.id === id) || null;
}

export function saveLead(lead: GymLead): GymLead {
  leadsCache.set(lead.id, lead);

  if (typeof window !== 'undefined') {
    try {
      const all = getAllLeads();
      const idx = all.findIndex((l) => l.id === lead.id);
      if (idx >= 0) {
        all[idx] = lead;
      } else {
        all.unshift(lead);
      }
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Error saving lead to localStorage', e);
    }
  }

  return lead;
}

export function attachDemoToLead(
  leadId: string,
  demoSlug: string,
  demoUrl: string
): GymLead | null {
  const lead = getLeadById(leadId);
  if (!lead) return null;

  const updated: GymLead = {
    ...lead,
    demoSlug,
    demoUrl,
    appStatus: 'demo_ready',
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  return saveLead(updated);
}

/**
 * Format CSV Export with required exact columns:
 * [Gym Name, Website, Contact Email, Mobile App Status, Personalized Demo URL]
 */
export function exportLeadsToCsv(leads: GymLead[]): string {
  const headers = ['Gym Name', 'Website', 'Contact Email', 'Mobile App Status', 'Personalized Demo URL'];

  const rows = leads.map((lead) => {
    let statusLabel = 'No Mobile App';
    if (lead.appStatus === 'demo_ready') statusLabel = 'Demo App Ready';
    else if (lead.appStatus === 'third_party_only') statusLabel = 'Third-Party Web Only';
    else if (lead.appStatus === 'outdated_app') statusLabel = 'Outdated App';

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fitscale-engine.io';
    const fullDemoUrl = lead.demoUrl
      ? lead.demoUrl.startsWith('http')
        ? lead.demoUrl
        : `${origin}${lead.demoUrl}`
      : 'None (Needs Demo)';

    // Escape CSV quotes and commas
    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

    return [
      escapeCsv(lead.name),
      escapeCsv(lead.website),
      escapeCsv(lead.contactEmail),
      escapeCsv(statusLabel),
      escapeCsv(fullDemoUrl),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
