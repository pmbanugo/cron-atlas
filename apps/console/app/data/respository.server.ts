import { and, eq, sql } from "drizzle-orm";
import { getDbClient } from "./db";
import { apiTokens, jobs } from "./schema";
import type { ScheduleType } from "./types";

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

export async function getJob({
  userId,
  jobId,
}: {
  userId: string;
  jobId: string;
}) {
  const db = getDbClient();
  const data = await db.query.jobs.findFirst({
    columns: {
      createdAt: false,
      updatedAt: false,
      userId: false,
    },
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
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

export async function updateJob({
  jobId,
  userId,
  data: { name, schedule, scheduleType },
}: {
  userId: string;
  jobId: string;
  data: { name: string; scheduleType: ScheduleType; schedule: string };
}) {
  const db = getDbClient();
  return await db
    .update(jobs)
    .set({
      name,
      schedule: {
        type: scheduleType,
        value: schedule,
      },
      updatedAt: sql`(strftime('%s', 'now'))`,
    })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .returning({
      id: jobs.id,
      name: jobs.name,
      jobType: jobs.jobType,
      schedule: jobs.schedule,
      functionConfig: jobs.functionConfig,
      endpoint: jobs.endpoint,
    });
}
