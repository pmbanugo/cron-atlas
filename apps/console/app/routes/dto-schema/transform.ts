import type { FunctionRuntime } from "@cron-atlas/workflow";
import type { Job } from "~/data/schema";
import { raiseError } from "~/lib/utils";

type BaseJobDTO = Pick<Job, "id" | "name" | "schedule" | "jobType">;
type URLJobDTO = BaseJobDTO & {
  endpoint: {
    url: string;
  };
};
type ScheduledFunctionJobDTO = BaseJobDTO & {
  runtime: FunctionRuntime;
  secrets?: string[];
};

export function formatJobForAPI(
  job: Omit<Job, "createdAt" | "updatedAt" | "userId">
): URLJobDTO | ScheduledFunctionJobDTO {
  const url = job.endpoint.url;

  return job.jobType === "url"
    ? {
        id: job.id,
        name: job.name,
        jobType: job.jobType,
        schedule: job.schedule,
        endpoint: url
          ? { url: url }
          : raiseError("URL is missing in job object"),
      }
    : {
        id: job.id,
        name: job.name,
        jobType: job.jobType,
        schedule: job.schedule,
        runtime:
          job?.functionConfig?.runtime ??
          raiseError("runtime is missing in job object"),
        secrets: job?.functionConfig?.secrets,
      };
}
