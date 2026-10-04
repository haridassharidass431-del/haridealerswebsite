import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSession, verifyAdminCredentials } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  let credentials: { username?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 });
  }

  if (typeof credentials.username !== 'string' || typeof credentials.password !== 'string') {
    return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 });
  }

  if (!verifyAdminCredentials(credentials.username, credentials.password)) {
    return NextResponse.json({ error: 'Incorrect username or password' }, { status: 401 });
  }

  try {
    const session = createAdminSession();
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    console.error('Admin session configuration error:', error);
    return NextResponse.json({ error: 'Admin login is not configured on this server.' }, { status: 503 });
  }
}
