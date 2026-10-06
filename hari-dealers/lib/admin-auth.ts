import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'hd_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 &&
    !secret.includes('placeholder') &&
    !secret.includes('replace-with') &&
    !secret.includes('your-')
    ? secret
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
  const defaultUsername = 'Haridealers';
  const defaultPassword = 'Hari@2007';
  const expectedUsername = (process.env.ADMIN_USERNAME || defaultUsername).trim();
  const expectedPassword = (process.env.ADMIN_PASSWORD || defaultPassword).trim();

  return Boolean(
    expectedUsername === 'haridealers' &&
    expectedPassword &&
    !expectedUsername.includes('change-this') &&
    !expectedPassword.includes('change-this') &&
    constantTimeEquals(username.trim(), expectedUsername) &&
    constantTimeEquals(password, expectedPassword)
  );
}

export function createAdminSession() {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('Set ADMIN_SESSION_SECRET (at least 32 characters) to sign admin sessions.');
  }

  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS);
  const role = 'admin';
  return {
    token: `${expiresAt}.${role}.${sign(`${expiresAt}.${role}`, secret)}`,
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function isValidAdminSession(token?: string) {
  const secret = getSessionSecret();
  if (!secret || !token) return false;

  const [expiresAt, role, signature, extra] = token.split('.');
  if (!expiresAt || role !== 'admin' || !signature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  return constantTimeEquals(signature, sign(`${expiresAt}.${role}`, secret));
}
