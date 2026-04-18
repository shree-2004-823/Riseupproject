import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/http.js';

function normalizeRole(role: string) {
  return role.trim().toUpperCase();
}

export function requireRoles(...roles: string[]) {
  const allowedRoles = new Set(roles.map(normalizeRole));

  return function enforceRoles(request: Request, _response: Response, next: NextFunction) {
    if (!request.auth) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }

    if (!allowedRoles.has(normalizeRole(request.auth.role))) {
      next(new HttpError(403, 'You do not have permission to access this resource'));
      return;
    }

    next();
  };
}
