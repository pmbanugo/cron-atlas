import { json } from "@remix-run/node";
import { getDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { and, eq } from "drizzle-orm";
import { deleteSchedule } from "~/cron/delete-schedule";
import { getEnv, getFlyAppName } from "~/lib/utils";
import { createClient } from "fly-admin";
import type { JobType } from "~/data/types";

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
