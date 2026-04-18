import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { app } from './app.js';
import { runRefinedSchemaBackfill } from './services/schema-init-service.js';

async function maybeRunSchemaBackfill() {
  if (!env.RUN_SCHEMA_BACKFILL_ON_STARTUP) {
    return;
  }

  const result = await runRefinedSchemaBackfill();
  console.log('Refined schema backfill complete', result);
}

await maybeRunSchemaBackfill();

const server = app.listen(env.PORT, () => {
  console.log(`API server listening on http://localhost:${env.PORT}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});
