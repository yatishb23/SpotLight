import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/server/backend-proxy';

export async function POST(req: NextRequest) {
  try {
    return proxyToBackend(req, { backendPath: '/api/events' });

  } catch (error) {
    console.error("FULL ERROR:", error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}