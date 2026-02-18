import { NextResponse } from 'next/server';

import { readCounters } from '@/lib/telemetry';

export async function GET() {
  return NextResponse.json({ counters: readCounters() });
}
