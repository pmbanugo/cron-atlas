import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { JobsTable } from "~/components/jobs";
import { Button } from "~/components/ui/button";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { getSessionManager } from "~/lib/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionManager = getSessionManager();
  const user = await sessionManager.requireUser(request);

  const db = buildDbClient();
  const data = await db.query.jobs.findMany({
    columns: { id: true, name: true, schedule: true, endpoint: true },
    where: eq(jobs.userId, user.userId),
  });

  return json({ jobs: data });
};

export default function Index() {
  const { jobs } = useLoaderData<typeof loader>();
  return (
    <div>
      <Button asChild>
        <Link to="job">New Cron Job</Link>
      </Button>
      <div className="pt-4">
        <JobsTable jobs={jobs} />
      </div>
    </div>
  );
}
