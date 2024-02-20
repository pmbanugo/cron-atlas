import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getJobs } from "~/data/respository.server";
import type { Job } from "~/data/schema";
import { requireUserId } from "~/lib/api.server";

type JobDTO = Pick<Job, "id" | "name" | "schedule" | "jobType">;

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const jobs: JobDTO[] = await getJobs({ userId: userId });
  return json({ jobs });
}
