import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { database } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== Leave Management Debug Test ===');
    
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
        session: 'not found',
        fix: 'Please log in at http://localhost:3000/auth/login'
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
    
    // Test 4: Leave requests table structure
    console.log('4. Testing leave_requests table...');
    const tableInfo = database.prepare("PRAGMA table_info(leave_requests)").all();
    console.log('Leave table structure:', tableInfo);
    
    // Test 5: Sample leave query
    console.log('5. Testing leave query...');
    const leaves = database.prepare(`
      SELECT leave_id, user_id, leave_type, start_date, end_date, status 
      FROM leave_requests 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(session.userId);
    console.log('Leave test:', leaves);
    
    // Test 6: Check if user can create leave requests
    console.log('6. Testing leave creation...');
    const canCreate = session.userType === 'EMPLOYEE';
    console.log('Can create leave:', canCreate);
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      session: 'found',
      user: userTest,
      tableStructure: tableInfo,
      existingLeaves: leaves,
      canCreateLeave: canCreate,
      message: 'All tests passed - leave management should work'
    });
    
  } catch (error) {
    console.error('Leave debug test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
