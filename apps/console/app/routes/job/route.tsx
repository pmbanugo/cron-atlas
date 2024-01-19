import {
  redirect,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { startApiSchedule } from "~/cron/start-schedule";
import type { ScheduleType } from "~/data/types";
import type { CronJobFormData } from "~/components/job-form";
import {
  CronJobForm,
  jobTypes,
  runtimes,
  scheduleTypes,
} from "~/components/job-form";
import { getSessionManager } from "~/lib/session.server";
import { eq, sql } from "drizzle-orm";
import { createScheduledFunction } from "./logic.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Job Schedule" },
    { name: "description", content: "Create Job Schedule" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const sessionManager = getSessionManager();
  const { userId } = await sessionManager.requireUser(request);

  const formData = await request.formData();
  const { name, url, schedule, scheduleType, jobType, runtime, file } =
    Object.fromEntries(formData) as CronJobFormData;

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
  const countResult = await db
    .select({
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(jobs)
    .where(eq(jobs.userId, userId));

  if (countResult[0].count >= 4) {
    return { errors: { generic: "You can't create more than 4 jobs" } };
  }

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

  return redirect("/");
};

export default function CreateJob() {
  return (
    <div>
      <h1 className="text-xl">Create Job Schedule</h1>
      <CronJobForm />
    </div>
  );
}
