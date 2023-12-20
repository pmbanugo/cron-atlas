import { defer, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { and, eq } from "drizzle-orm";
import { getRecent } from "~/cron/schedule-history";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { BadgeCheck } from "lucide-react";
import { Suspense } from "react";
import { getSessionManager } from "~/lib/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Recent Jobs" },
    { name: "description", content: "Recent Job Runs" },
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sessionManager = getSessionManager();
  const userId = await sessionManager.requireUserId(request);

  if (!params.id) {
    return redirect("/404");
  }

  const db = buildDbClient();
  const job = await db.query.jobs.findFirst({
    columns: { endpoint: true, id: true },
    where: and(eq(jobs.id, params.id), eq(jobs.userId, userId)),
  });

  if (!job) {
    return redirect("/404");
  }

  return defer({
    url: job.endpoint.url,
    recentRuns: getRecent({ jobId: job.id }),
  });
};

export default function RecentJobRuns() {
  const { recentRuns, url } = useLoaderData<typeof loader>();
  return (
    <div>
      <div className="text-xl">
        Recent Job Runs for <span className="text-base italic">{url}</span>
      </div>
      <Suspense
        fallback={
          <div>
            <div className="rounded-md border mt-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Timeout</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading data .....
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        }
      >
        <Await resolve={recentRuns}>
          {(job) => (
            <>
              <div className="my-4">Total Job Runs: {job?.totalActions}</div>
              <div className="rounded-md border mt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Timeout</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {job !== null && job.recentActions.length > 0 ? (
                      job.recentActions.map(
                        ({
                          takenAt,
                          result: { timeout, success, status },
                          workflowId,
                        }) => (
                          <TableRow
                            key={workflowId}
                            className={success ? "bg-lime-400" : "bg-rose-500"}
                          >
                            <TableCell>{takenAt}</TableCell>
                            <TableCell>
                              {timeout ? (
                                <BadgeCheck className=" fill-slate-200" />
                              ) : null}
                            </TableCell>
                            <TableCell>{status}</TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No result.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
