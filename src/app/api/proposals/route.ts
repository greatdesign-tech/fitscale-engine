import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, saveLead } from '@/lib/leadStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, notes, gymName, location, attachedLeadId } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Update lead record in local store if attachedLeadId is present
    if (attachedLeadId) {
      const existingLead = getLeadById(attachedLeadId);
      if (existingLead) {
        saveLead({
          ...existingLead,
          contactName: name,
          contactEmail: email,
          notes: `[Proposal Request] Name: ${name} | Email: ${email} | Notes: ${notes || 'None'} | Prior: ${existingLead.notes || ''}`,
          lastUpdated: new Date().toISOString().split('T')[0],
        });
      }
    }

    // Forward directly to taiwo.adediji.apps@gmail.com via form action service
    try {
      await fetch('https://formsubmit.co/ajax/taiwo.adediji.apps@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': req.headers.get('origin') || 'https://fitscale-engine.io',
          'Referer': req.headers.get('referer') || 'https://fitscale-engine.io',
        },
        body: JSON.stringify({
          'Prospect Name & Role': name,
          'Work Email': email,
          'Gym Name': gymName || 'Not specified',
          'Gym Location': location || 'Not specified',
          'Questions or Notes': notes || 'None',
          '_subject': `✦ New Proposal Inquiry: ${gymName || 'Gym'} (${name})`,
          '_replyto': email,
          '_captcha': 'false',
          '_template': 'table',
        }),
      });
    } catch (forwardErr) {
      console.error('Server forwarding to form action service error:', forwardErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal request received and forwarded successfully',
    });
  } catch (error) {
    console.error('Proposal route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
