import { NextRequest, NextResponse } from 'next/server';
import { getServerDemoBySlug } from '@/lib/serverStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const demo = getServerDemoBySlug(slug);

    if (!demo) {
      return NextResponse.json(
        { success: false, error: `Demo with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: demo });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
