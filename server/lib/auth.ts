import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}

function buildCookieAttributes(maxAgeSeconds?: number) {
  const attributes = [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure');
  }

  if (typeof maxAgeSeconds === 'number') {
    attributes.push(`Max-Age=${maxAgeSeconds}`);
  }

  return attributes;
}

export function setAuthCookie(response: Response, token: string) {
  response.append(
    'Set-Cookie',
    [`${env.AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`, ...buildCookieAttributes(60 * 60 * 24 * 7)].join('; '),
  );
}

export function clearAuthCookie(response: Response) {
  response.append(
    'Set-Cookie',
    [
      `${env.AUTH_COOKIE_NAME}=`,
      ...buildCookieAttributes(0),
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ].join('; '),
  );
}

export function getTokenFromCookieHeader(cookieHeader?: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookiePairs = cookieHeader.split(';');

  for (const pair of cookiePairs) {
    const [rawName, ...rawValueParts] = pair.trim().split('=');

    if (rawName === env.AUTH_COOKIE_NAME) {
      return decodeURIComponent(rawValueParts.join('='));
    }
  }

  return null;
}
