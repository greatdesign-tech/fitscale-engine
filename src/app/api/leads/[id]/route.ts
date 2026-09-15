import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, saveLead, attachDemoToLead } from '@/lib/leadStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = getLeadById(params.id);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { demoSlug, demoUrl, ...otherFields } = body;

    let updated;
    if (demoSlug && demoUrl) {
      updated = attachDemoToLead(params.id, demoSlug, demoUrl);
    } else {
      const existing = getLeadById(params.id);
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Lead not found' },
          { status: 404 }
        );
      }
      updated = saveLead({ ...existing, ...otherFields });
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update lead' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
