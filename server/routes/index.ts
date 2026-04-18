import { Router } from 'express';
import { authRouter } from './auth.js';
import { onboardingRouter } from './onboarding.js';
import { habitsRouter } from './habits.js';
import { moodRouter } from './mood.js';
import { cravingsRouter } from './cravings.js';
import { quitSupportRouter } from './quit-support.js';
import { plannerRouter } from './planner.js';
import { dashboardRouter } from './dashboard.js';
import { adminRouter } from './admin.js';
import { journalRouter } from './journal.js';
import { progressRouter } from './progress.js';
import { aiRouter } from './ai.js';
import { remindersRouter } from './reminders.js';
import { challengesRouter } from './challenges.js';
import { profileRouter } from './profile.js';
import { settingsRouter } from './settings.js';
import { communityRouter } from './community.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/onboarding', onboardingRouter);
apiRouter.use('/habits', habitsRouter);
apiRouter.use('/mood', moodRouter);
apiRouter.use('/cravings', cravingsRouter);
apiRouter.use('/quit-support', quitSupportRouter);
apiRouter.use('/planner', plannerRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/journal', journalRouter);
apiRouter.use('/progress', progressRouter);
apiRouter.use('/challenges', challengesRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/community', communityRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/reminders', remindersRouter);
apiRouter.use('/admin', adminRouter);
