import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'hd_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const validSecret = secret && secret.length >= 32 &&
    secret !== process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !/placeholder|replace-with|your-/i.test(secret);
  return validSecret ? secret : null;
}

function sign(expiresAt: string, secret: string) {
  return createHmac('sha256', secret).update(expiresAt).digest('hex');
}

function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isPlaceholderCredential(value?: string) {
  return Boolean(value && /change-this|replace-with|your-|placeholder/i.test(value));
}

export function areAdminCredentialsConfigured() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(username && password && !isPlaceholderCredential(username) && !isPlaceholderCredential(password));
}

export function verifyAdminCredentials(username: string, password: string) {
  const configuredUsername = process.env.ADMIN_USERNAME?.trim();
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!areAdminCredentialsConfigured() || !configuredUsername || !configuredPassword) return false;

  return Boolean(
    constantTimeEquals(username.trim().toLowerCase(), configuredUsername.toLowerCase()) &&
    constantTimeEquals(password, configuredPassword)
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
