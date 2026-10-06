import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSession, verifyAdminCredentials } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') && request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  let credentials: { username?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  if (typeof credentials.username !== 'string' || typeof credentials.password !== 'string') {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  if (!verifyAdminCredentials(credentials.username, credentials.password)) {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const session = createAdminSession();
    const response = NextResponse.json({ authenticated: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(ADMIN_SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: session.maxAge,
      expires: new Date(Date.now() + session.maxAge * 1000),
    });
    return response;
  } catch (error) {
    console.error('Admin session configuration error:', error);
    return NextResponse.json({ error: 'Admin login is not configured on this server.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
