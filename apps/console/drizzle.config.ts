import type { Config } from "drizzle-kit";

function retrieveDbCredentials() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_DB_AUTH_TOKEN;
  if (!url || !authToken) {
    return {
      url: "file:turso-db",
    };
  }

  return {
    url,
    authToken,
  };
}

export default {
  schema: "./app/data/schema.ts",
  out: "./drizzle/migrations",
  driver: "turso",
  dbCredentials: retrieveDbCredentials(),
} satisfies Config;
