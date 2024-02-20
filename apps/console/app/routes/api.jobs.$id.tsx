import type { FunctionRuntime } from "@cron-atlas/workflow";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getDescription } from "~/cron/schedule-info";
import { getApiToken, getJob } from "~/data/respository.server";
import type { Job } from "~/data/schema";
import { getApiTokenHash } from "~/lib/auth.server";

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

export async function loader({ request, params }: LoaderFunctionArgs) {
  const jobId = params.id;
  if (!jobId) {
    return new Response("Job Id is required in path", { status: 400 });
  }

  const requestToken = request.headers.get("authentication");
  if (!requestToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const hashedToken = getApiTokenHash(requestToken.replace("Bearer ", ""));
  const apiToken = await getApiToken(hashedToken);
  if (!apiToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const job = await getJob({ userId: apiToken.userId, jobId });
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
