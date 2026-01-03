import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      return NextResponse.json({ status: 'ok', database: 'connected' });
    } else {
      return NextResponse.json(
        { status: 'error', database: 'disconnected' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'error', database: 'error', error: String(error) },
      { status: 500 }
    );
  }
}
