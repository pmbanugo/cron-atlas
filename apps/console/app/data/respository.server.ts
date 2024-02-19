import { eq } from "drizzle-orm";
import { getDbClient } from "./db";
import { apiTokens, jobs } from "./schema";

export async function getJobs({ userId }: { userId: string }) {
  const db = getDbClient();
  const data = await db.query.jobs.findMany({
    columns: {
      id: true,
      name: true,
      schedule: true,
      jobType: true,
    },
    where: eq(jobs.userId, userId),
    orderBy: (jobs, { desc }) => [desc(jobs.id)],
  });
  return data;
}

export async function getApiToken(hashedToken: string) {
  const db = getDbClient();
  const apiToken = await db.query.apiTokens.findFirst({
    where: eq(apiTokens.token, hashedToken),
    columns: {
      id: true,
      userId: true,
    },
  });
  return apiToken;
}
