'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Download,
  Plus,
  Zap,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Filter,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  Building,
  Check,
  Share2,
} from 'lucide-react';
import { GymLead, AppStatus } from '@/types';
import { getAllLeads, saveLead, exportLeadsToCsv } from '@/lib/leadStore';

export default function LeadFinderPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<GymLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'no_app' | 'demo_ready'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedDemoId, setCopiedDemoId] = useState<string | null>(null);

  // New lead form state
  const [newGymName, setNewGymName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('TX');
  const [newWebsite, setNewWebsite] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStudioType, setNewStudioType] = useState<GymLead['studioType']>('Athletic Club');

  useEffect(() => {
    // 1. Initial local render
    setLeads(getAllLeads());

    // 2. Authoritative server sync
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLeads(data.data);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('fitscale_leads_v1', JSON.stringify(data.data));
            } catch (e) {}
          }
        }
      })
      .catch((err) => console.warn('Could not fetch leads from server:', err));
  }, []);

  // Filter logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'no_app'
        ? lead.appStatus !== 'demo_ready'
        : lead.appStatus === 'demo_ready';

    const matchesCity = cityFilter === 'all' || lead.city.toLowerCase() === cityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCity;
  });

  const cities = Array.from(new Set(leads.map((l) => l.city)));

  // CSV Export handler
  const handleExportCsv = () => {
    const csvContent = exportLeadsToCsv(filteredLeads);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fitscale-gym-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1-Click "⚡ Create Demo App" handler
  const handleCreateDemoApp = (lead: GymLead) => {
    const params = new URLSearchParams({
      leadId: lead.id,
      name: lead.name,
      city: `${lead.city}, ${lead.state}`,
      email: lead.contactEmail,
      website: lead.website,
      studioType: lead.studioType,
    });
    if (lead.demoSlug) {
      params.set('edit', lead.demoSlug);
    }
    router.push(`/admin/builder?${params.toString()}`);
  };

  // Add new lead
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGymName || !newEmail) return;

    const newLead: GymLead = {
      id: `lead-${Date.now()}`,
      name: newGymName,
      website: newWebsite || `https://${newGymName.toLowerCase().replace(/\s+/g, '')}.com`,
      contactEmail: newEmail,
      contactName: 'General Manager',
      city: newCity || 'Austin',
      state: newState || 'TX',
      studioType: newStudioType,
      appStatus: 'no_app',
      notes: 'Manually added prospect lead.',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    saveLead(newLead);
    setLeads(getAllLeads());
    setIsAddModalOpen(false);

    // Persist to server disk
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
    } catch (err) {
      console.error('Error saving lead to server:', err);
    }

    // Reset form
    setNewGymName('');
    setNewWebsite('');
    setNewEmail('');
    setNewCity('');
  };

  const copyDemoLink = (leadId: string, url: string) => {
    if (typeof navigator !== 'undefined') {
      const full = url.startsWith('http') ? url : `${window.location.origin}${url}`;
      navigator.clipboard.writeText(full);
      setCopiedDemoId(leadId);
      setTimeout(() => setCopiedDemoId(null), 2000);
    }
  };

  // Metrics
  const totalCount = leads.length;
  const noAppCount = leads.filter((l) => l.appStatus !== 'demo_ready').length;
  const demoReadyCount = leads.filter((l) => l.appStatus === 'demo_ready').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Prospect Pipeline & Lead Generation
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            GymLead Finder
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover gyms lacking branded mobile apps, build interactive prototypes in 1 click, and export outreach lists.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-2 transition shadow-sm"
            title="Export CSV: [Gym Name, Website, Contact Email, Mobile App Status, Personalized Demo URL]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Add Lead Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prospect</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Total Prospects</div>
          <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across US metropolitan hubs</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm">
          <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>No Mobile App</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{noAppCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">High opportunity cold outreach</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Demos Ready</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{demoReadyCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Interactive prototype links created</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm">
          <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pipeline Value</span>
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">${(totalCount * 4500).toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">@ $4.5k avg. app setup fee</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gym, city, or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setStatusFilter('no_app')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'no_app'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Needs Demo ({noAppCount})
            </button>
            <button
              onClick={() => setStatusFilter('demo_ready')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'demo_ready'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Demo Ready ({demoReadyCount})
            </button>
          </div>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-white/10 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Gym Name & Type</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Website</th>
                <th className="py-3.5 px-4">Contact Email</th>
                <th className="py-3.5 px-4">Mobile App Status</th>
                <th className="py-3.5 px-4">Personalized Demo URL</th>
                <th className="py-3.5 px-4 text-right">Primary Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No gym leads match the selected search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const hasDemo = lead.appStatus === 'demo_ready' && lead.demoUrl;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Gym Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{lead.name}</div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {lead.studioType}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.city}, {lead.state}</span>
                        </div>
                      </td>

                      {/* Website */}
                      <td className="py-3.5 px-4">
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition font-mono text-[11px]"
                        >
                          <span>{lead.website.replace('https://', '').replace('http://', '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      {/* Contact Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{lead.contactEmail}</div>
                        {lead.contactName && (
                          <div className="text-[10px] text-slate-400">{lead.contactName}</div>
                        )}
                      </td>

                      {/* Mobile App Status */}
                      <td className="py-3.5 px-4">
                        {lead.appStatus === 'demo_ready' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Demo Ready
                          </span>
                        ) : lead.appStatus === 'third_party_only' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" /> Third-Party Web Only
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            <AlertTriangle className="w-3 h-3" /> No App (High Opportunity)
                          </span>
                        )}
                      </td>

                      {/* Personalized Demo Link */}
                      <td className="py-3.5 px-4">
                        {hasDemo ? (
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={lead.demoUrl!}
                              target="_blank"
                              className="text-[11px] font-mono font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <span>{lead.demoUrl}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>

                            <button
                              onClick={() => copyDemoLink(lead.id, lead.demoUrl!)}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                              title="Copy URL"
                            >
                              {copiedDemoId === lead.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            None (Needs Demo)
                          </span>
                        )}
                      </td>

                      {/* Action Button: ⚡ Create Demo App */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleCreateDemoApp(lead)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ml-auto transition shadow-md active:scale-95 ${
                            hasDemo
                              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{hasDemo ? 'Edit Demo App' : '⚡ Create Demo App'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add New Gym Prospect</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gym / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  value={newGymName}
                  onChange={(e) => setNewGymName(e.target.value)}
                  placeholder="e.g. Paramount Strength Club"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Austin"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    State (e.g. TX)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newState}
                    onChange={(e) => setNewState(e.target.value.toUpperCase())}
                    placeholder="TX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Owner / Decision-Maker Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="owner@paramountstrength.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  placeholder="https://paramountstrength.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Studio Type
                </label>
                <select
                  value={newStudioType}
                  onChange={(e) => setNewStudioType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
                >
                  <option value="Athletic Club">Athletic Club</option>
                  <option value="CrossFit Box">CrossFit Box</option>
                  <option value="Pilates & Yoga">Pilates & Yoga</option>
                  <option value="Boxing & HIIT">Boxing & HIIT</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
