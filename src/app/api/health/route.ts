import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    // Test session
    const session = await getSession();
    
    if (isConnected) {
      return NextResponse.json({ 
        status: 'ok', 
        database: 'connected',
        session: session ? 'found' : 'not found',
        sessionData: session
      });
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
