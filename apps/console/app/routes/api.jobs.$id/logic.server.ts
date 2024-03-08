import { json } from "@remix-run/node";
import { getDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { and, eq } from "drizzle-orm";
import { deleteSchedule } from "~/cron.server/delete-schedule";
import { getEnv, getFlyAppName } from "~/lib/utils";
import { createClient } from "fly-admin";
import type { JobType } from "~/data/types";
import {
  updateApiSchedule,
  updateFunctionSchedule,
} from "~/cron.server/update-schedule";
import { is } from "valibot";
import { BaseJobInputSchema, UrlJobInputSchema } from "./schema";
import { updateJob as updateDbJob } from "~/data/respository.server";

// Refactoring: Most (if not all) of these functions are also used in the route handler for the webforms. Perhaps a more generic folder could hold this file. For now, I'll leave it here.

export async function deleteJob({
  job,
  userId,
}: {
  job: {
    id: string;
    jobType: JobType;
  };
  userId: string;
}) {
  const db = getDbClient();
  const jobId = job.id;

  switch (job.jobType) {
    case "function": {
      const flyClient = createClient(getEnv("FLY_API_TOKEN"));
      const flyAppName = getFlyAppName(jobId);
      const flyAppRequestPromise = flyClient.App.deleteApp(flyAppName);

      const uploadRequestPromise = fetch(getEnv("FUNCTION_STORE_DOMAIN"), {
        method: "DELETE",
        body: JSON.stringify({ jobId, userId }),
        headers: {
          Authorization: `ApiKey ${process.env.FUNCTION_STORE_API_KEY}`,
        },
      });

      const deleteSchedulePromise = deleteSchedule({
        jobId: jobId,
        isScheduledFunction: true,
      });

      await Promise.all([
        flyAppRequestPromise,
        uploadRequestPromise,
        deleteSchedulePromise,
      ]);

      await db
        .delete(jobs)
        .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));
      break;
    }
    case "url": {
      await deleteSchedule({
        jobId: jobId,
        isScheduledFunction: false,
      }).catch((err) => {
        console.error(`Failed to delete schedule ${jobId} from Temporal`, err);
        throw json(
          { message: "Failed to delete schedule. Please contact support" },
          500
        );
      });

      await db
        .delete(jobs)
        .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));
      break;
    }
    default:
      break;
  }
}

export async function updateJob({
  jobId,
  userId,
  formData,
}: {
  jobId: string;
  userId: string;
  formData: FormData;
}) {
  const data = Object.fromEntries(formData);
  let updatedJob: Awaited<ReturnType<typeof updateDbJob>>;

  switch (true) {
    case is(UrlJobInputSchema, data):
      updatedJob = await updateDbJob({
        jobId,
        userId,
        data: {
          name: data.name,
          scheduleType: data.scheduleType,
          schedule: data.schedule,
        },
      });
      if (updatedJob.length > 0) {
        await updateApiSchedule({
          jobId: jobId,
          schedule: {
            scheduleType: data.scheduleType,
            value: data.schedule,
          },
        });

        return updatedJob[0];
      }
      break;

    case is(BaseJobInputSchema, data) && data.jobType === "function":
      updatedJob = await updateDbJob({
        jobId,
        userId,
        data: {
          name: data.name,
          scheduleType: data.scheduleType,
          schedule: data.schedule,
        },
      });
      if (updatedJob.length > 0) {
        await updateFunctionSchedule({
          jobId,
          schedule: {
            scheduleType: data.scheduleType,
            value: data.schedule,
          },
        });

        return updatedJob[0];
      }
      break;

    default:
      throw new Response("Invalid request payload or 'jobType'", {
        status: 400,
      });
  }
}
