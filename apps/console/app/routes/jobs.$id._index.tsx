import { json, redirect } from "@remix-run/node";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import type { ScheduleType } from "~/data/types";
import { and, eq, sql } from "drizzle-orm";
import type { CronJobFormData } from "~/components/job-form";
import {
  CronJobForm,
  formTypes,
  jobTypes,
  runtimes,
  scheduleTypes,
} from "~/components/job-form";
import {
  updateApiSchedule,
  updateFunctionSchedule,
  updateScheduledFunctionArgs,
} from "~/cron/update-schedule";
import { getSessionManager } from "~/lib/session.server";
import { getEnv, getFlyAppName } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Update Job Schedule" },
    { name: "description", content: "Update Job Schedule" },
  ];
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const jobId = params.id;
  const userId = await getSessionManager().requireUserId(request);
  if (!jobId) {
    return redirect("/404");
  }

  const formData = await request.formData();
  const formType = formData.get("formType");
  const { name, schedule, scheduleType, jobType, runtime, file } =
    Object.fromEntries(formData) as CronJobFormData;

  if (formType && formType === formTypes.functionUpload) {
    if (!runtime || !Object.keys(runtimes).includes(runtime)) {
      throw new Error("Invalid runtime value");
    }

    if (!file || file.type !== "text/javascript" || file.size === 0) {
      return { errors: { file: "File must be a JS file." } };
    }

    const db = buildDbClient();
    const existingJob = await db.query.jobs.findFirst({
      where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
      columns: {
        id: true,
      },
    });
    if (!existingJob) {
      return redirect("/404");
    }

    const functionStoreUrl = getEnv("FUNCTION_STORE_DOMAIN");

    const funcStoreFormData = new FormData();
    funcStoreFormData.append("userId", userId);
    funcStoreFormData.append("jobId", jobId);
    funcStoreFormData.append("file", file);
    const uploadResponse = await fetch(functionStoreUrl, {
      method: "POST",
      body: funcStoreFormData,
      headers: {
        Authorization: `ApiKey ${process.env.FUNCTION_STORE_API_KEY}`,
      },
    });

    if (!uploadResponse.ok) {
      return {
        errors: {
          generic: "Error uploading function file",
        },
      };
    }

    await updateScheduledFunctionArgs({
      jobId,
      runtime,
      userId,
      flyAppName: getFlyAppName(jobId),
    });
  } else {
    if (
      !name ||
      !schedule ||
      !scheduleType ||
      !Object.keys(scheduleTypes).includes(scheduleType) ||
      !jobType ||
      !Object.keys(jobTypes).includes(jobType)
    ) {
      return {
        errors: {
          generic: "Missing required fields",
        },
      };
    }

    if (name.length > 100) {
      return { errors: { name: "Name must be less than 100 characters" } };
    }

    const db = buildDbClient();
    const existingJob = await db.query.jobs.findFirst({
      where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
      columns: {
        id: true,
      },
    });
    if (!existingJob) {
      return redirect("/404");
    }

    await db
      .update(jobs)
      .set({
        name,
        schedule: {
          type: scheduleType as ScheduleType,
          value: schedule,
        },
        updatedAt: sql`(strftime('%s', 'now'))`,
      })
      .where(eq(jobs.id, jobId));

    switch (jobType) {
      case "url": {
        await updateApiSchedule({
          jobId: jobId,
          schedule: {
            scheduleType: scheduleType as ScheduleType,
            value: schedule,
          },
        });
        break;
      }
      case "function": {
        await updateFunctionSchedule({
          jobId,
          schedule: {
            scheduleType: scheduleType as ScheduleType,
            value: schedule,
          },
        });
        break;
      }
      default:
        throw new Error(`Invalid job type: ${jobType}`);
    }
  }

  return redirect("/");
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sessionManager = getSessionManager();
  const userId = await sessionManager.requireUserId(request);

  if (!params.id) {
    return redirect("/404");
  }

  const db = buildDbClient();
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, params.id), eq(jobs.userId, userId)),
    columns: {
      createdAt: false,
      updatedAt: false,
      userId: false,
    },
  });

  if (!job) {
    return redirect("/404");
  }

  return json({ job });
};

export default function UpdateJob() {
  const { job } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-none tracking-tight mb-2">
        Update Job Schedule
      </h1>
      <CronJobForm job={job} />
    </div>
  );
}
