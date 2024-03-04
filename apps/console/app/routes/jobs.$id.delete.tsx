import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { and, eq } from "drizzle-orm";
import { getSessionManager } from "~/lib/session.server";
import { deleteJob } from "./api.jobs.$id/logic.server";

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

  const db = getDbClient();
  const job = await db.query.jobs.findFirst({
    columns: { id: true, jobType: true },
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });

  if (job) {
    await deleteJob({ job, userId });
    return redirect("/");
  }

  return redirect("/404");
};
