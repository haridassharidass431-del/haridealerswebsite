import { NextRequest, NextResponse } from 'next/server';

function fromHex(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null;
  return Uint8Array.from(value.match(/.{2}/g) || [], (byte) => parseInt(byte, 16));
}

async function hasAdminSession(token: string | undefined) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret || secret.length < 32 || /placeholder|replace-with|your-/i.test(secret)) return false;
  const [expiresAt, role, signature, extra] = token.split('.');
  const signatureBytes = signature ? fromHex(signature) : null;
  if (!expiresAt || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000) || role !== 'admin' || extra || !signatureBytes) return false;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    return crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(`${expiresAt}.${role}`));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === '/admin/login';
  const authenticated = await hasAdminSession(request.cookies.get('hd_admin_session')?.value);
  let response: NextResponse;
  if (isLogin && authenticated) {
    response = NextResponse.redirect(new URL('/admin', request.url));
  } else if (!isLogin && !authenticated) {
    response = NextResponse.redirect(new URL('/admin/login', request.url));
  } else {
    response = NextResponse.next();
  }
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
