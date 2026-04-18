import { MoodLabel, QuoteCategory } from '@prisma/client';
import { defaultQuotes } from '../lib/default-quotes.js';
import { prisma } from '../lib/prisma.js';

const QUOTE_ROTATION_WINDOW_MS = 5 * 60 * 1000;

function normalizeCategory(category?: string | QuoteCategory | null) {
  if (!category) {
    return null;
  }

  return category.toUpperCase() as QuoteCategory;
}

export function getQuoteCategoryForMood(moodLabel?: MoodLabel | null) {
  if (!moodLabel) {
    return QuoteCategory.MOTIVATION;
  }

  switch (moodLabel) {
    case MoodLabel.STRESSED:
    case MoodLabel.ANXIOUS:
    case MoodLabel.OVERWHELMED:
      return QuoteCategory.CALM;
    case MoodLabel.SAD:
    case MoodLabel.FRUSTRATED:
    case MoodLabel.TIRED:
      return QuoteCategory.COMEBACK;
    case MoodLabel.MOTIVATED:
      return QuoteCategory.FOCUS;
    default:
      return QuoteCategory.MOTIVATION;
  }
}

export async function getRotatingQuote(options?: {
  category?: string | QuoteCategory | null;
  offset?: number;
}) {
  const category = normalizeCategory(options?.category);
  const offset = options?.offset ?? 0;

  const dbQuotes = await prisma.quote.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const fallbackQuotes = defaultQuotes.filter((quote) => {
    return category ? quote.category === category : true;
  });

  const source = dbQuotes.length > 0 ? dbQuotes : fallbackQuotes;

  if (source.length === 0) {
    return null;
  }

  const bucket = Math.floor(Date.now() / QUOTE_ROTATION_WINDOW_MS) + offset;
  return source[bucket % source.length];
}
