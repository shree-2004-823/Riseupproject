import type { NextFunction, Request, Response } from 'express';
import { getTokenFromCookieHeader, verifyToken } from '../lib/auth.js';
import { HttpError } from '../lib/http.js';

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const cookieToken = getTokenFromCookieHeader(request.headers.cookie);
  const token = cookieToken;

  if (!token) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }

  try {
    request.auth = verifyToken(token);
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}
