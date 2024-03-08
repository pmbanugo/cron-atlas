import type { FunctionRuntime } from "@cron-atlas/workflow";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { getDescription } from "~/cron.server/schedule-info";
import { getDbClient } from "~/data/db";
import { getJob } from "~/data/respository.server";
import { jobs, type Job } from "~/data/schema";
import { requireUserId } from "~/lib/api.server";
import { deleteJob, updateJob } from "./logic.server";

type BaseJobDTO = Pick<Job, "id" | "name" | "schedule" | "jobType"> & {
  paused: boolean;
};
type URLJobDTO = BaseJobDTO & {
  endpoint: {
    url: string;
  };
};
type ScheduledFunctionJobDTO = BaseJobDTO & {
  runtime: FunctionRuntime;
  secrets?: string[];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const jobId = params.id;
  if (!jobId) {
    return new Response("Job Id is required in path", { status: 400 });
  }
  const userId = await requireUserId(request);

  const db = getDbClient();
  const job = await db.query.jobs.findFirst({
    columns: { id: true, jobType: true },
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });
  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  switch (request.method) {
    case "DELETE":
      await deleteJob({ job, userId });
      return json("OK");
    case "PUT": {
      const useJsonBody =
        request.headers.get("Content-Type") === "application/json";
      const requestData = useJsonBody
        ? await request.json()
        : Object.fromEntries(await request.formData());

      const job = await updateJob({ jobId, userId, data: requestData });

      if (job) {
        const url = job.endpoint.url;
        return json({
          id: job.id,
          name: job.name,
          jobType: job.jobType,
          schedule: job.schedule,
          runtime: job?.functionConfig?.runtime,
          secrets: job?.functionConfig?.secrets,
          endpoint: url ? { url: url } : undefined,
        });
      }

      return new Response("Couldn't update job", { status: 500 });
    }

    default:
      return new Response("No handler for this request path and method", {
        status: 400,
      });
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const jobId = params.id;
  if (!jobId) {
    return new Response("Job Id is required in path", { status: 400 });
  }

  const userId = await requireUserId(request);

  const job = await getJob({ userId, jobId });
  if (!job) {
    return new Response("Job not Found", { status: 404 });
  }

  const scheduleDescription = await getDescription({
    jobId,
    isScheduledFunction: job.jobType === "function",
  });

  if (!scheduleDescription) {
    return new Response("Error retrieving schedule information", {
      status: 500,
    });
  }

  const dto: URLJobDTO | ScheduledFunctionJobDTO =
    job.jobType === "url"
      ? {
          id: job.id,
          name: job.name,
          schedule: job.schedule,
          jobType: job.jobType,
          endpoint: { url: job.endpoint.url },
          paused: scheduleDescription.paused,
        }
      : {
          id: job.id,
          name: job.name,
          schedule: job.schedule,
          jobType: job.jobType,
          runtime: job?.functionConfig?.runtime as FunctionRuntime,
          secrets: job?.functionConfig?.secrets,
          paused: scheduleDescription.paused,
        };

  return json(dto);
}
