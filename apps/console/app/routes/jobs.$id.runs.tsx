import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { CardTitle, CardHeader, CardContent, Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { buildDbClient } from "~/data/db";
import { jobs } from "~/data/schema";
import { and, eq } from "drizzle-orm";
import { getRecent } from "~/cron/schedule-history";
import { getSessionManager } from "~/lib/session.server";
import { Gauge } from "lucide-react";
import { useLoaderData } from "@remix-run/react";
import type { JobType } from "~/data/types";
import type {
  RemoteJobResult,
  ScheduledFunctionResult,
} from "@cron-atlas/workflow";

export const meta: MetaFunction = () => {
  return [
    { title: "Recent Jobs" },
    { name: "description", content: "Recent Job Runs" },
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sessionManager = getSessionManager();
  const userId = await sessionManager.requireUserId(request);
  const jobId = params.id;

  if (!jobId) {
    return redirect("/404");
  }

  const db = buildDbClient();
  const job = await db.query.jobs.findFirst({
    columns: { endpoint: true, id: true, name: true, jobType: true },
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });

  if (!job) {
    return redirect("/404");
  }

  return json({
    name: job.name,
    url: job.endpoint.url,
    jobType: job.jobType,
    runInfo: await getRecent({
      jobId: job.id,
      isScheduledFunction: job.jobType === "function",
    }),
  });
};

export default function Detail() {
  const { name, runInfo, jobType } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Job Monitor</CardTitle>
          <div className="flex items-center gap-2">
            <Gauge className="w-6 h-6" />
            <span className="text-sm text-gray-600">{name}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-lg">Total Job Runs:</p>
            <Badge className="py-1 px-2 text-lg font-semibold">
              {runInfo?.totalActions ?? 0}
            </Badge>
          </div>
          {runInfo?.recentActions.length && runInfo.recentActions.length > 0 ? (
            <>
              <p className="text-gray-500 mb-4">Recent Summaries:</p>
              <div className="divide-y divide-gray-200">
                {runInfo.recentActions.map((action, index) => (
                  <div key={action.workflowId} className="py-2">
                    <p className="font-medium">
                      Job #{runInfo.totalActions - index}
                    </p>
                    <Result result={action.result} jobType={jobType} />
                    <p className="text-sm text-gray-500">
                      Time: {action.takenAt}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 mb-4">No runs yet.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Result({
  result,
  jobType,
}: {
  result: RemoteJobResult | ScheduledFunctionResult;
  jobType: JobType;
}) {
  return (
    <>
      {"success" in result ? (
        <p className="text-sm text-gray-600">
          Status:{" "}
          {result.timeout
            ? "Timeout"
            : result.success
            ? `Successful HTTP (${result.status})`
            : `Failed HTTP (${result.status})`}
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          Status:{" "}
          {result.timeout
            ? "Timeout"
            : result.error
            ? "Function exited with an error"
            : "Function completed successfully"}
        </p>
      )}
    </>
  );
}
