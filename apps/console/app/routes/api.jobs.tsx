import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getApiToken, getJobs } from "~/data/respository.server";
import type { Job } from "~/data/schema";
import { getApiTokenHash } from "~/lib/auth.server";

type JobDTO = Pick<Job, "id" | "name" | "schedule" | "jobType">;

export async function loader({ request }: LoaderFunctionArgs) {
  const requestToken = request.headers.get("authentication");
  if (!requestToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const hashedToken = getApiTokenHash(requestToken.replace("Bearer ", ""));
  const apiToken = await getApiToken(hashedToken);
  if (!apiToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const jobs: JobDTO[] = await getJobs({ userId: apiToken.userId });
  return json({ jobs });
}
