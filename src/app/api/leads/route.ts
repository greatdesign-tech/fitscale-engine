import { NextRequest, NextResponse } from 'next/server';
import { getAllServerLeads, saveServerLead } from '@/lib/serverLeadStore';
import { GymLead } from '@/types';

export async function GET() {
  try {
    const leads = getAllServerLeads();
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: GymLead = await req.json();
    if (!body.name || !body.contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Gym Name and Contact Email are required' },
        { status: 400 }
      );
    }
    const leadToSave: GymLead = {
      ...body,
      id: body.id || `lead-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    const saved = saveServerLead(leadToSave);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}
