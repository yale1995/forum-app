import migrationRunner from "node-pg-migrate";
import database from "infra/database";
import { resolve } from "node:path";
import { createRouter } from "next-connect";

import controller from "infra/controller";

const router = createRouter();

router.get(getHandler).post(postHandler);
export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dryRun: true,
  direction: "up",
  dir: resolve("infra", "migrations"),
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return response.status(200).json(pendingMigrations);
  } finally {
    dbClient.end();
  }
}

async function postHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  } finally {
    dbClient.end();
  }
}
