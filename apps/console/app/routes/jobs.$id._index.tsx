import { json, redirect } from "@remix-run/node";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { JOB_TYPES, SCHEDULE_TYPES } from "~/data/types";
import { and, eq } from "drizzle-orm";
import type { CronJobFormData } from "~/components/job-form";
import { CronJobForm, formTypes } from "~/components/job-form";
import { updateScheduledFunctionArgs } from "~/cron.server/update-schedule";
import { getSessionManager } from "~/lib/session.server";
import { getEnv, getFlyAppName } from "~/lib/utils";
import { FUNCTION_RUNTIME_OPTIONS } from "@cron-atlas/workflow";
import { updateJob } from "./api.jobs.$id/logic.server";

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

  const db = getDbClient();
  const existingJob = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
    columns: {
      id: true,
    },
  });
  if (!existingJob) {
    return redirect("/404");
  }

  const formData = await request.formData();
  const formDataObject = Object.fromEntries(formData);
  const { name, schedule, scheduleType, jobType, runtime, file } =
    formDataObject as CronJobFormData;
  const formType = formData.get("formType");

  if (formType && formType === formTypes.functionUpload) {
    if (!runtime || !FUNCTION_RUNTIME_OPTIONS.includes(runtime)) {
      throw new Error("Invalid runtime value");
    }

    if (!file || file.type !== "text/javascript" || file.size === 0) {
      return { errors: { file: "File must be a JS file." } };
    }
    if (file.size > 1024 * 1024 * 2) {
      return { errors: { file: "File must be less than 2 MB." } };
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
    //TODO: since I use Valibot schema validation in the updateJob() function, how do I get better error messages and return validation errors to the user? This code was pre-valibot inclusion to the app.
    if (
      !name ||
      !schedule ||
      !scheduleType ||
      !SCHEDULE_TYPES.includes(scheduleType) ||
      !jobType ||
      !JOB_TYPES.includes(jobType)
    ) {
      return {
        errors: {
          generic: "Missing required fields",
        },
      };
    }
    if (name.length > 100 || name.length < 2) {
      return { errors: { name: "Name must be between 2 to 100 characters" } };
    }

    await updateJob({ jobId, userId, data: formDataObject });
  }

  return redirect("/");
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sessionManager = getSessionManager();
  const userId = await sessionManager.requireUserId(request);

  if (!params.id) {
    return redirect("/404");
  }

  const db = getDbClient();
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
