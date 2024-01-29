import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { and, eq } from "drizzle-orm";
import { getSessionManager } from "~/lib/session.server";
import { deleteSchedule } from "~/cron/delete-schedule";
import { getEnv, getFlyAppName } from "~/lib/utils";
import { createClient } from "fly-admin";

export const loader = async () => {
  return redirect("/");
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const sessionManager = getSessionManager();
  const userId = await sessionManager.requireUserId(request);
  const jobId = params.id;

  if (!jobId) {
    return redirect("/404");
  }

  const db = buildDbClient();
  const job = await db.query.jobs.findFirst({
    columns: { id: true, jobType: true },
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });

  if (job) {
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
      //default deletes url function type because some early DB data didn't have the jobType column
      default: {
        await deleteSchedule({
          jobId: jobId,
          isScheduledFunction: false,
        }).catch((err) => {
          console.error(
            `Failed to delete schedule ${params.id} from Temporal`,
            err
          );
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
    }
    return redirect("/");
  }

  return redirect("/404");
};
