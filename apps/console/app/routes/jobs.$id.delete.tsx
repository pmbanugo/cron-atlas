import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { buildDbClient } from "~/data/db";
import { jobs, users } from "~/data/schema";
import { and, eq } from "drizzle-orm";
import { getSessionManager } from "~/lib/session.server";
import { deleteSchedule } from "~/cron/delete-schedule";

export const loader = async () => {
  return redirect("/");
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const sessionManager = getSessionManager();
  const userId = await sessionManager.requireUserId(request);

  if (!params.id) {
    return redirect("/404");
  }

  const db = buildDbClient();
  const deleted = await db
    .delete(jobs)
    .where(and(eq(jobs.id, params.id), eq(jobs.userId, userId)))
    .returning({ id: users.id });

  if (deleted.length > 0) {
    await deleteSchedule({
      jobId: params.id,
      isScheduledFunction: false,
    }).catch((err) => {
      //TODO: perhaps send email to admin/internal Slack so we can investigate and manually remove this schedule from Temporal. Or mark as deleted in Turso DB, then have a Temporal Workflow that takes care of deleting it from Turso & Temporal, thereby handling errors & retries.

      console.error(
        `Failed to delete schedule ${params.id} from Temporal`,
        err
      );
      throw json(
        { message: "Failed to delete schedule. Please contact support" },
        500
      );
    });

    return redirect("/");
  }
};
