import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'hd_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const validSecret = secret && secret.length >= 32 &&
    !secret.includes('placeholder') &&
    !secret.includes('replace-with') &&
    !secret.includes('your-');
  if (validSecret) return secret;
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

function isPlaceholderCredential(value?: string) {
  return Boolean(value && /change-this|replace-with|your-|placeholder/i.test(value));
}

export function areAdminCredentialsConfigured() {
  if (process.env.NODE_ENV !== 'production') return true;
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  return Boolean(username && password && !isPlaceholderCredential(username) && !isPlaceholderCredential(password));
}

export function verifyAdminCredentials(username: string, password: string) {
  const defaultUsername = 'Haridealers';
  const defaultPassword = 'Hari@2007';

  const configuredUsername = process.env.ADMIN_USERNAME?.trim();
  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!areAdminCredentialsConfigured()) return false;

  const expectedUsername = isPlaceholderCredential(configuredUsername)
    ? defaultUsername
    : (configuredUsername || defaultUsername);
  const expectedPassword = isPlaceholderCredential(configuredPassword)
    ? defaultPassword
    : (configuredPassword || defaultPassword);

  return Boolean(
    expectedUsername &&
    expectedPassword &&
    constantTimeEquals(username.trim().toLowerCase(), expectedUsername.toLowerCase()) &&
    constantTimeEquals(password.trim(), expectedPassword.trim())
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
