import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  chatWithCoach,
  executeCoachAction,
  getCoachConversationState,
  resetCoachConversation,
} from '../services/ai-coach-service.js';
import { aiActionSchema, aiChatSchema } from '../validators/ai.js';

export const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.get(
  '/conversation',
  asyncHandler(async (request, response) => {
    const conversation = await getCoachConversationState(request.auth!.userId);

    response.json(conversation);
  }),
);

aiRouter.post(
  '/conversation/reset',
  asyncHandler(async (request, response) => {
    const conversation = await resetCoachConversation(request.auth!.userId);

    response.json(conversation);
  }),
);

aiRouter.post(
  '/chat',
  asyncHandler(async (request, response) => {
    const parsed = aiChatSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid AI chat payload', parsed.error.flatten());
    }

    const result = await chatWithCoach(request.auth!.userId, parsed.data.message, parsed.data.conversationId);

    response.json({
      message: result.reply,
      context: result.context,
      provider: result.provider,
      conversationId: result.conversationId,
      messages: result.messages,
      suggestedActions: result.suggestedActions,
    });
  }),
);

aiRouter.post(
  '/action',
  asyncHandler(async (request, response) => {
    const parsed = aiActionSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid AI action payload', parsed.error.flatten());
    }

    const result = await executeCoachAction(request.auth!.userId, parsed.data.actionId, parsed.data.conversationId);

    response.json({
      message: result.reply,
      context: result.context,
      provider: result.provider,
      conversationId: result.conversationId,
      messages: result.messages,
      executedActionId: result.executedActionId,
      suggestedActions: result.suggestedActions,
    });
  }),
);
