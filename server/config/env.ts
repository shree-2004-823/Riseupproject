import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  AUTH_COOKIE_NAME: z.string().default('riseup_session'),
  ADMIN_ACCESS_KEY: z.string().default('7483621466'),
  AI_PROVIDER: z.enum(['auto', 'openai', 'gemini']).default('auto'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-5-mini'),
  OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  RUN_SCHEMA_BACKFILL_ON_STARTUP: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
  ADMIN_ACCESS_KEY: process.env.ADMIN_ACCESS_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  OPENAI_TIMEOUT_MS: process.env.OPENAI_TIMEOUT_MS,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GEMINI_TIMEOUT_MS: process.env.GEMINI_TIMEOUT_MS,
  RUN_SCHEMA_BACKFILL_ON_STARTUP: process.env.RUN_SCHEMA_BACKFILL_ON_STARTUP,
});
