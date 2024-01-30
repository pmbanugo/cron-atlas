import { ulid } from "ulidx";
import { runtimes, type CronJobFormData } from "~/components/job-form";
import { getEnv, getFlyAppName, raiseError } from "~/lib/utils";
import { createClient } from "fly-admin";
import { json } from "@remix-run/node";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import type { ScheduleType } from "~/data/types";
import {
  startApiSchedule,
  startScheduledFunction,
} from "~/cron/start-schedule";
import { deleteSchedule } from "~/cron/delete-schedule";

export async function saveJob({
  name,
  url,
  schedule,
  scheduleType,
  jobType,
  runtime,
  file,
  userId,
  db,
}: Required<Omit<CronJobFormData, "file" | "runtime" | "url">> &
  Pick<CronJobFormData, "file" | "runtime" | "url"> & {
    userId: string;
    db: ReturnType<typeof buildDbClient>;
  }) {
  switch (jobType) {
    case "url": {
      if (!url) {
        return { errors: { generic: "URL is required" } };
      }

      const result = await db
        .insert(jobs)
        .values({
          name,
          endpoint: { url: url },
          jobType,
          schedule: {
            type: scheduleType as ScheduleType,
            value: schedule,
          },
          userId,
        })
        .returning({ jobId: jobs.id });

      await startApiSchedule({
        url: url,
        jobId: result[0].jobId,
        schedule: {
          scheduleType: scheduleType as ScheduleType,
          value: schedule,
        },
      });

      break;
    }
    case "function": {
      if (!runtime || !Object.keys(runtimes).includes(runtime)) {
        throw new Error("Invalid runtime value");
      }
      if (!file || file.type !== "text/javascript" || file.size === 0) {
        return { errors: { file: "File must be a JS file." } };
      }

      await createScheduledFunction({
        data: { name, schedule, scheduleType, runtime, file, jobType },
        userId,
      });
      break;
    }
    default:
      throw new Error(`Invalid job type: ${jobType}`);
  }
}

export async function createScheduledFunction({
  data,
  userId,
}: {
  data: Required<Omit<CronJobFormData, "url">>;
  userId: string;
}) {
  const flyOrgSlug =
    process.env.FLY_ORG_SLUG ||
    raiseError("missing FLY_ORG_SLUG in environment");
  const flyClient = createClient(
    process.env.FLY_API_TOKEN ||
      raiseError("missing FLY_API_TOKEN in environment")
  );

  const jobId = ulid();
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("jobId", jobId);
  formData.append("file", data.file);

  const functionStoreUrl = getEnv("FUNCTION_STORE_DOMAIN");
  const uploadRequestPromise = fetch(functionStoreUrl, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `ApiKey ${process.env.FUNCTION_STORE_API_KEY}`,
    },
  });

  const flyAppName = getFlyAppName(jobId);
  const flyAppRequestPromise = flyClient.App.createApp({
    app_name: flyAppName,
    org_slug: flyOrgSlug,
    network: `func-${jobId}`,
  });

  const [uploadRequest, flyAppRequest] = await Promise.allSettled([
    uploadRequestPromise,
    flyAppRequestPromise,
  ]);

  await handleCompensation({
    uploadRequest,
    flyAppRequest,
    flyClient,
    flyAppName,
    functionStoreUrl,
    userId,
    jobId,
  });

  console.log({
    id: jobId,
    name: data.name,
    endpoint: { url: "" },
    jobType: "function",
    functionConfig: {
      runtime: data.runtime,
    },
    schedule: {
      type: data.scheduleType,
      value: data.schedule,
    },
    userId,
  });

  const db = buildDbClient();
  const insertPromise = db
    .insert(jobs)
    .values({
      id: jobId,
      name: data.name,
      endpoint: { url: "" }, //empty url because we can't modify this column. Although libSQL (Turso) supports it, I'll have to keep this code until I write a manual migration SQL to do it in my Turso DB, or wait for Drizzle to support it natively for Turso. https://dub.sh/Xs7Ae6I
      jobType: "function",
      functionConfig: {
        runtime: data.runtime,
      },
      schedule: {
        type: data.scheduleType as ScheduleType,
        value: data.schedule,
      },
      userId,
    })
    .execute();

  const schedulePromise = startScheduledFunction({
    jobId,
    userId,
    flyAppName,
    runtimeImage: data.runtime,
    schedule: {
      scheduleType: data.scheduleType as ScheduleType,
      value: data.schedule,
    },
  });

  const [insertResult, scheduleResult] = await Promise.allSettled([
    insertPromise,
    schedulePromise,
  ]);

  if (insertResult.status !== "fulfilled") {
    await completeRollback({
      reason: insertResult.reason,
      flyClient,
      flyAppName,
      functionStoreUrl,
      userId,
      jobId,
      scheduleResult,
    });
  }
  // ignore the failure of the `schedulePromise` for now, because it can be manually fixed by admin or user later.
}

/** rolls back every action before now. It's also a compensation logic, so perhaps find a better name for the handleCompensation() function so that it's clear about the difference between the two compensation logic. */
async function completeRollback({
  reason,
  flyClient,
  flyAppName,
  functionStoreUrl,
  userId,
  jobId,
  scheduleResult,
}: {
  reason: any;
  flyClient: ReturnType<typeof createClient>;
  flyAppName: string;
  functionStoreUrl: string;
  userId: string;
  jobId: string;
  scheduleResult: PromiseSettledResult<void>;
}) {
  console.error("failed to save job to DB", reason);
  let deleteSchedulePromise =
    scheduleResult.status === "fulfilled"
      ? deleteSchedule({
          jobId,
          isScheduledFunction: true,
        })
      : Promise.resolve();

  await Promise.allSettled([
    flyClient.App.deleteApp(flyAppName),
    fetch(functionStoreUrl, {
      method: "DELETE",
      body: JSON.stringify({ userId, jobId }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
    deleteSchedulePromise,
  ]);
  console.info(
    "successfully rolled back changes for function store and fly app"
  );

  throw json("Error occured while saving scheduled function.", 500);
}

async function handleCompensation({
  uploadRequest,
  flyAppRequest,
  flyClient,
  flyAppName,
  functionStoreUrl,
  userId,
  jobId,
}: {
  uploadRequest: PromiseSettledResult<Response>;
  flyAppRequest: PromiseSettledResult<void>;
  flyClient: ReturnType<typeof createClient>;
  flyAppName: string;
  functionStoreUrl: string;
  userId: string;
  jobId: string;
}): Promise<void> {
  const uploadRequestOk =
    uploadRequest.status === "fulfilled" && uploadRequest.value.ok;

  if (!uploadRequestOk) {
    console.error("failed to save function file");
    if (flyAppRequest.status === "fulfilled") {
      await flyClient.App.deleteApp(flyAppName);
    }
    throw json("Error occured while saving function file.", 500);
  }

  if (flyAppRequest.status !== "fulfilled") {
    console.error("failed to create fly app");
    if (uploadRequestOk) {
      await fetch(functionStoreUrl, {
        method: "DELETE",
        body: JSON.stringify({ userId, jobId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    throw json("Error occured while creating scheduled function.", 500);
  }
}
