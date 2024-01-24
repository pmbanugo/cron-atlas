import {
  condition,
  proxyActivities,
  setHandler,
  workflowInfo,
  log,
} from "@temporalio/workflow";
import type * as activities from "./activities";
import type { CronCallResult } from "./types";
import type { JobFinishedInput } from "./signal";
import { jobFinishedSignal } from "./signal";

const { callJobApi } = proxyActivities<typeof activities>({
  startToCloseTimeout: "2 minutes",
  retry: {
    maximumAttempts: 1,
  },
});

const { createMachine } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minutes",
  retry: {
    maximumAttempts: 10,
    maximumInterval: "2 minutes",
  },
});

const { deleteMachine } = proxyActivities<typeof activities>({
  startToCloseTimeout: "2 minutes",
});

export async function triggerJob({
  url,
}: {
  url: string;
}): Promise<CronCallResult> {
  return await callJobApi(url);
}

export async function runScheduledFunction({
  userId,
  jobId,
  flyAppName,
  runtimeImage,
}: {
  userId: string;
  jobId: string;
  flyAppName: string;
  runtimeImage: string;
}) {
  let jobFinishedSuccessfully = false;
  const machine = await createMachine({
    flyAppName,
    runtimeImage,
    userId,
    jobId,
  });

  setHandler(
    jobFinishedSignal,
    ({ workflowId, machineId, runId }: JobFinishedInput) => {
      const currentWorkflowId = workflowInfo().workflowId;

      if (
        currentWorkflowId === workflowId &&
        machine.id === machineId &&
        workflowInfo().runId === runId
      ) {
        log.debug("Job finished successfully");
        jobFinishedSuccessfully = true;
      }
    }
  );

  const jobTimedOut = !(await condition(
    () => jobFinishedSuccessfully,
    // TODO: adjust this timeout before going to production
    "2 minutes"
  ));
  if (jobTimedOut) {
    await deleteMachine({ id: machine.id, flyAppName });
  }

  return { timeout: jobTimedOut };
}
