import { QuoteCategory } from '@prisma/client';

export const defaultQuotes = [
  {
    id: 'default-motivation',
    content: 'Small steps still move you forward.',
    author: 'Unknown',
    category: QuoteCategory.MOTIVATION,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'default-discipline',
    content: 'Discipline is remembering what you want most.',
    author: 'Unknown',
    category: QuoteCategory.DISCIPLINE,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'default-calm',
    content: 'Pause. Breathe. Begin again.',
    author: 'Unknown',
    category: QuoteCategory.CALM,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'default-recovery',
    content: 'Recovery counts as progress.',
    author: 'Unknown',
    category: QuoteCategory.RECOVERY,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'default-comeback',
    content: 'A setback is not the end of your story.',
    author: 'Unknown',
    category: QuoteCategory.COMEBACK,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'default-focus',
    content: 'Focus on the next right action.',
    author: 'Unknown',
    category: QuoteCategory.FOCUS,
    isActive: true,
    sortOrder: 6,
  },
] as const;
