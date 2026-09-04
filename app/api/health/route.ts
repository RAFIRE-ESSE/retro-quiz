import { NextResponse } from 'next/server';
import { getDbStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getDbStatus();
    return NextResponse.json({
      status: 'ok',
      database: status,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
