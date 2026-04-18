import { Router } from 'express';
import { asyncHandler } from '../lib/http.js';
import { authenticate } from '../middleware/authenticate.js';
import { getDashboardData } from '../services/dashboard-service.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const data = await getDashboardData(request.auth!.userId);
    response.json(data);
  }),
);
