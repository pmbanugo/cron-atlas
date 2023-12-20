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
import { CronJobForm } from "~/components/job-form";
import { update } from "~/cron/update-schedule";
import { getSessionManager } from "~/lib/session.server";

const scheduleTypes = {
  interval: "Interval",
  cron: "Cron Expression",
  once: "Once",
} as const satisfies Record<ScheduleType, string>;

export const meta: MetaFunction = () => {
  return [
    { title: "Update Job Schedule" },
    { name: "description", content: "Create Job Schedule" },
  ];
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (!params.id) {
    return redirect("/404");
  }

  const formData = await request.formData();
  const { name, schedule, scheduleType } = Object.fromEntries(
    formData
  ) as CronJobFormData;
  if (
    name === null ||
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
    .where(eq(jobs.id, params.id));

  await update({
    jobId: params.id,
    schedule: {
      scheduleType: scheduleType as ScheduleType,
      value: schedule,
    },
  });

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
      <h1 className="text-xl">Update Job Schedule</h1>
      <CronJobForm job={job} />
    </div>
  );
}
