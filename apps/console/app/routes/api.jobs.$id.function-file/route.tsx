import type { ActionFunctionArgs } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { safeParse } from "valibot";
import { getDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { requireUserId } from "~/lib/api.server";
import { updateScheduledFunction } from "./logic.server";
import { FunctionFileUploadInputSchema } from "../dto-schema";

export async function action({ request, params }: ActionFunctionArgs) {
  const jobId = params.id;
  if (!jobId) {
    return new Response("Job Id is required in path", { status: 400 });
  }
  const userId = await requireUserId(request);

  const db = getDbClient();
  const job = await db.query.jobs.findFirst({
    columns: { id: true, jobType: true, functionConfig: true },
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });
  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  switch (request.method) {
    case "POST": {
      const requestData = Object.fromEntries(await request.formData());
      const validationResult = safeParse(
        FunctionFileUploadInputSchema,
        requestData
      );
      if (!validationResult.success) {
        return new Response(
          validationResult.issues.map((issue) => issue.message).join("\n"),
          { status: 400 }
        );
      }

      const data = validationResult.output;
      await updateScheduledFunction({
        jobId,
        userId,
        data: data,
        currentFunctionConfig: job.functionConfig,
      });

      return new Response("Function Updated", { status: 200 });
    }
    default:
      return new Response("No handler for this request path and method", {
        status: 400,
      });
  }
}
