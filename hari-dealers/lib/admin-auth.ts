import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'hd_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const candidates = [process.env.ADMIN_SESSION_SECRET, process.env.SUPABASE_SERVICE_ROLE_KEY];
  const configuredSecret = candidates.find((secret) =>
    Boolean(
      secret &&
      secret.length >= 32 &&
      !secret.includes('placeholder') &&
      !secret.includes('replace-with') &&
      !secret.includes('your-')
    )
  );
  if (configuredSecret) return configuredSecret;
  return process.env.NODE_ENV === 'development'
    ? 'hari-dealers-local-development-session-signing-key'
    : null;
}

function sign(expiresAt: string, secret: string) {
  return createHmac('sha256', secret).update(expiresAt).digest('hex');
}

function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME || '';
  const expectedPassword = process.env.ADMIN_PASSWORD || '';

  return Boolean(
    expectedUsername &&
    expectedPassword &&
    !expectedUsername.includes('change-this') &&
    !expectedPassword.includes('change-this') &&
    constantTimeEquals(username, expectedUsername) &&
    constantTimeEquals(password, expectedPassword)
  );
}

export function createAdminSession() {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('Set ADMIN_SESSION_SECRET or configure SUPABASE_SERVICE_ROLE_KEY to sign admin sessions.');
  }

  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS);
  return {
    token: `${expiresAt}.${sign(expiresAt, secret)}`,
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function isValidAdminSession(token?: string) {
  const secret = getSessionSecret();
  if (!secret || !token) return false;

  const [expiresAt, signature, extra] = token.split('.');
  if (!expiresAt || !signature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  return constantTimeEquals(signature, sign(expiresAt, secret));
}
