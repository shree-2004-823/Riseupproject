import { JournalEntryType } from '@prisma/client';
import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { markReminderEventsActedOn } from '../services/reminder-event-service.js';
import { journalSchema } from '../validators/journal.js';

export const journalRouter = Router();

journalRouter.use(authenticate);

function serializeEntry(entry: {
  id: string;
  title: string | null;
  content: string;
  emotionTag: string | null;
  createdAt: Date;
}) {
  return {
    id: entry.id,
    title: entry.title,
    content: entry.content,
    emotionTag: entry.emotionTag,
    createdAt: entry.createdAt.toISOString(),
  };
}

function deriveJournalTitle(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return 'Untitled entry';
  }

  const firstSentence = normalized.split(/[.!?]/)[0]?.trim() ?? normalized;
  const candidate = firstSentence || normalized;

  return candidate.length > 72 ? `${candidate.slice(0, 69).trim()}...` : candidate;
}

function inferJournalEntryType(params: { content: string; title?: string | null; emotionTag?: string | null }) {
  const normalized = `${params.title ?? ''} ${params.content} ${params.emotionTag ?? ''}`.toLowerCase();

  if (normalized.includes('gratitude') || normalized.includes('grateful') || normalized.includes('thankful')) {
    return JournalEntryType.GRATITUDE;
  }

  if (normalized.includes('relapse') || normalized.includes('slip') || normalized.includes('trigger')) {
    return JournalEntryType.RELAPSE_REFLECTION;
  }

  if (normalized.includes('hard day') || normalized.includes('overwhelmed') || normalized.includes('anxious')) {
    return JournalEntryType.HARD_DAY;
  }

  if (params.emotionTag) {
    return JournalEntryType.CHECK_IN;
  }

  return JournalEntryType.GENERAL;
}

journalRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: request.auth!.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        content: true,
        emotionTag: true,
        createdAt: true,
      },
    });

    response.json({
      entries: entries.map(serializeEntry),
    });
  }),
);

journalRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const parsed = journalSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid journal payload', parsed.error.flatten());
    }

    const userId = request.auth!.userId;
    const entry = await prisma.$transaction(async (transaction) => {
      const createdEntry = await transaction.journalEntry.create({
        data: {
          userId,
          title: parsed.data.title?.trim() || deriveJournalTitle(parsed.data.content),
          content: parsed.data.content,
          emotionTag: parsed.data.emotionTag || null,
          entryType: inferJournalEntryType({
            content: parsed.data.content,
            title: parsed.data.title,
            emotionTag: parsed.data.emotionTag,
          }),
        },
        select: {
          id: true,
          title: true,
          content: true,
          emotionTag: true,
          createdAt: true,
        },
      });

      await markReminderEventsActedOn(transaction, {
        userId,
        type: 'journal',
        actedAt: createdEntry.createdAt,
      });

      return createdEntry;
    });

    response.status(201).json({
      entry: serializeEntry(entry),
    });
  }),
);
