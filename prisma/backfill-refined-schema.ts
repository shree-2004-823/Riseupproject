import { prisma } from '../server/lib/prisma.js';
import { runRefinedSchemaBackfill } from '../server/services/schema-init-service.js';

async function main() {
  const result = await runRefinedSchemaBackfill();
  console.log('Backfill result:', result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
