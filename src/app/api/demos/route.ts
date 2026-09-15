import { NextRequest, NextResponse } from 'next/server';
import { getAllDemos, saveDemo } from '@/lib/store';
import { GymConfig } from '@/types';

export async function GET() {
  try {
    const demos = getAllDemos();
    return NextResponse.json({ success: true, data: demos });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch demos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: GymConfig = await req.json();
    if (!body.slug || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }
    const saved = saveDemo(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save demo' },
      { status: 500 }
    );
  }
}
