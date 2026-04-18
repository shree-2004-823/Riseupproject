import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { authenticate } from '../middleware/authenticate.js';
import { buildChallengeSnapshot, getActiveChallenges, joinChallenge } from '../services/challenge-service.js';

export const challengesRouter = Router();

challengesRouter.use(authenticate);

challengesRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    response.json(await buildChallengeSnapshot(request.auth!.userId));
  }),
);

challengesRouter.get(
  '/active',
  asyncHandler(async (request, response) => {
    response.json(await getActiveChallenges(request.auth!.userId));
  }),
);

challengesRouter.post(
  '/:id/join',
  asyncHandler(async (request, response) => {
    const challenge = await joinChallenge(request.auth!.userId, String(request.params.id));

    if (!challenge) {
      throw new HttpError(404, 'Challenge not found');
    }

    response.json({ challenge });
  }),
);
