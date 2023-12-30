import {
  redirect,
  type ActionFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { start } from "~/cron/start-schedule";
import type { ScheduleType } from "~/data/types";
import type { CronJobFormData } from "~/components/job-form";
import { CronJobForm } from "~/components/job-form";
import { getSessionManager } from "~/lib/session.server";
import { eq, sql } from "drizzle-orm";

const scheduleTypes = {
  interval: "Interval",
  cron: "Cron Expression",
  once: "Once",
} as const satisfies Record<ScheduleType, string>;

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
  const { name, url, schedule, scheduleType } = Object.fromEntries(
    formData
  ) as CronJobFormData;
  if (
    name === null ||
    url === null ||
    schedule === null ||
    scheduleType === null ||
    !Object.keys(scheduleTypes).includes(scheduleType)
  ) {
    throw new Error("Invalid form data");
  }

  if (name.length > 100) {
    throw new Error("Name can't be more than 100 characters");
  }

  const db = buildDbClient();

  const countResult = await db
    .select({
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(jobs)
    .where(eq(jobs.userId, userId));

  if (countResult[0].count >= 4) {
    //TODO: handle this state in the UI/Form.
    return json("You can't create more than 4 jobs", 400);
  }

  const result = await db
    .insert(jobs)
    .values({
      name,
      endpoint: { url: url },
      schedule: {
        type: scheduleType as ScheduleType,
        value: schedule,
      },
      userId,
    })
    .returning({ jobId: jobs.id });

  await start({
    url: url,
    jobId: result[0].jobId,
    schedule: {
      scheduleType: scheduleType as ScheduleType,
      value: schedule,
    },
  });

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
