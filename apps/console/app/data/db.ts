// import "dotenv/config";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

function retrieveDbCredentials({
  url,
  authToken,
}: {
  url?: string;
  authToken?: string;
}) {
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

// interface Env {
//   TURSO_DB_AUTH_TOKEN?: string;
//   TURSO_DB_URL?: string;
// }

// export function buildDbClientFromContext(context: AppLoadContext) {
//   const url = (context.env as unknown as Env).TURSO_DB_URL?.trim();
//   if (url === undefined) {
//     throw new Error("TURSO_DB_URL is not defined");
//   }

//   const authToken = (context.env as unknown as Env).TURSO_DB_AUTH_TOKEN?.trim();
//   if (authToken === undefined) {
//     throw new Error("TURSO_DB_AUTH_TOKEN is not defined");
//   }

//   return drizzle(createClient({ url, authToken }), { schema });
// }

let drizzleClient: LibSQLDatabase<typeof schema> | null = null;

/**
 * Instantiate or return a drizzle database client
 * @returns {LibSQLDatabase<typeof schema>}
 */
export function getDbClient() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_DB_AUTH_TOKEN;

  if (drizzleClient === null) {
    drizzleClient = drizzle(
      createClient(retrieveDbCredentials({ url, authToken })),
      {
        schema,
      }
    );
  }

  return drizzleClient;
}
