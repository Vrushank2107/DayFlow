import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format. Please check your input.' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = database.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get(email) as {
      user_id: number;
      name: string;
      email: string;
      password: string | null;
      phone: string | null;
      user_type: 'EMPLOYEE' | 'ADMIN';
      created_at: string;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Please set a password. Use registration to create an account.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.user_id, user.user_type);

    return NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Always return JSON, never let Next.js return HTML error page
    try {
      if (error instanceof Error) {
        if (error.message.includes('connect') || error.message.includes('database')) {
          return NextResponse.json(
            { error: 'Database connection error. Please check your database configuration or contact support.' },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: error.message || 'Failed to login. Please check your credentials and try again.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to login. Please try again later.' },
        { status: 500 }
      );
    } catch (responseError) {
      console.error('Failed to create error response:', responseError);
      return new NextResponse(
        JSON.stringify({ error: 'An unexpected error occurred. Please try again later.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
}
