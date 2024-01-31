import {
  redirect,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import type { CronJobFormData } from "~/components/job-form";
import { CronJobForm, jobTypes, scheduleTypes } from "~/components/job-form";
import { getSessionManager } from "~/lib/session.server";
import { eq, sql } from "drizzle-orm";
import { saveJob } from "./logic.server";

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

  const secretKeys = formData.getAll("secretKeys");
  const secretValues = formData.getAll("secretValues");

  const saveResult = await saveJob({
    name,
    url,
    schedule,
    scheduleType,
    jobType,
    runtime,
    file,
    secretKeys,
    secretValues,
    userId,
    db,
  });

  if (saveResult) {
    return saveResult;
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
