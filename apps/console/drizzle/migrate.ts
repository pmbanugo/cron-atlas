import { migrate } from "drizzle-orm/libsql/migrator";
import { buildDbClient } from "~/data/db";

const db = buildDbClient();

try {
  await migrate(db, {
    migrationsFolder: "drizzle/migrations",
  });
  console.log("Tables migrated!");
  process.exit(0);
} catch (error) {
  console.error("Error performing migration: ", error);
  process.exit(1);
}
