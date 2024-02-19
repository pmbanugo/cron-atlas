import { migrate } from "drizzle-orm/libsql/migrator";
import { getDbClient } from "~/data/db";

const db = getDbClient();

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
