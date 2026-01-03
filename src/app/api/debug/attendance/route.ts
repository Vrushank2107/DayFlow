import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== Attendance Debug Test ===');
    
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    const dbTest = database.prepare('SELECT 1 as test').get();
    console.log('Database test:', dbTest);
    
    // Test 2: Session
    console.log('2. Testing session...');
    const session = await getSession();
    console.log('Session:', session);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found - user not logged in',
        database: dbTest ? 'connected' : 'disconnected',
        session: 'not found'
      });
    }
    
    // Test 3: User exists
    console.log('3. Testing user exists...');
    const userTest = database.prepare('SELECT user_id, name, user_type FROM users WHERE user_id = ?').get(session.userId);
    console.log('User test:', userTest);
    
    if (!userTest) {
      return NextResponse.json({
        success: false,
        error: 'User not found in database',
        session: session,
        user: 'not found'
      });
    }
    
    // Test 4: Attendance table structure
    console.log('4. Testing attendance table...');
    const tableInfo = database.prepare("PRAGMA table_info(attendance)").all();
    console.log('Attendance table structure:', tableInfo);
    
    // Test 5: Sample attendance query
    console.log('5. Testing attendance query...');
    const today = new Date().toISOString().split('T')[0];
    const attendanceTest = database.prepare(`
      SELECT attendance_id, user_id, date, check_in, check_out 
      FROM attendance 
      WHERE user_id = ? AND date = ?
    `).get(session.userId, today);
    console.log('Attendance test:', attendanceTest);
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      session: 'found',
      user: userTest,
      tableStructure: tableInfo,
      todayAttendance: attendanceTest,
      message: 'All tests passed'
    });
    
  } catch (error) {
    console.error('Debug test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
