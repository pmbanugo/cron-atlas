import { is } from "valibot";
import { ScheduledFunctionInputSchema, UrlJobInputSchema } from "../dto-schema";
import { startApiSchedule } from "~/cron.server/start-schedule";
import { getDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { createScheduledFunction } from "../job/logic.server";

// TODO: (Refactoring): Most (if not all) of these functions are also used in the route handler for the webforms. Perhaps a more generic folder could hold this file. For now, I'll leave it here.

export async function saveJob({
  userId,
  data,
}: {
  userId: string;
  data: Record<string, any>;
}) {
  switch (true) {
    case is(UrlJobInputSchema, data): {
      const db = getDbClient();
      const result = await db
        .insert(jobs)
        .values({
          name: data.name,
          endpoint: { url: data.url },
          jobType: data.jobType,
          schedule: {
            type: data.scheduleType,
            value: data.schedule,
          },
          userId,
        })
        .returning({
          id: jobs.id,
          name: jobs.name,
          jobType: jobs.jobType,
          schedule: jobs.schedule,
          functionConfig: jobs.functionConfig,
          endpoint: jobs.endpoint,
        });

      await startApiSchedule({
        url: data.url,
        jobId: result[0].id,
        schedule: {
          scheduleType: data.scheduleType,
          value: data.schedule,
        },
      });
      return result[0];
    }

    case is(ScheduledFunctionInputSchema, data): {
      const result = await createScheduledFunction({
        data: data,
        userId,
      });
      return result;
    }

    default:
      throw new Response("Invalid request payload", {
        status: 400,
      });
  }
}
