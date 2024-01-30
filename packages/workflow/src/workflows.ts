import {
  condition,
  proxyActivities,
  setHandler,
  workflowInfo,
  log,
} from "@temporalio/workflow";
import type * as activities from "./activities";
import type { RemoteJobResult, ScheduledFunctionResult } from "./types";
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
}): Promise<RemoteJobResult> {
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
}): Promise<ScheduledFunctionResult> {
  let jobFinishedSuccessfully = false;
  let jobErrorResult: undefined | ScheduledFunctionResult["error"];

  const machine = await createMachine({
    flyAppName,
    runtimeImage,
    userId,
    jobId,
  });

  setHandler(
    jobFinishedSignal,
    ({ workflowId, machineId, runId, error }: JobFinishedInput) => {
      const currentWorkflowId = workflowInfo().workflowId;

      if (
        currentWorkflowId === workflowId &&
        machine.id === machineId &&
        workflowInfo().runId === runId
      ) {
        log.debug("Job finished successfully");
        jobErrorResult = error;
        jobFinishedSuccessfully = true;
      }
    }
  );

  const jobTimedOut = !(await condition(
    () => jobFinishedSuccessfully,
    "10 minutes"
  ));
  if (jobTimedOut) {
    await deleteMachine({ id: machine.id, flyAppName });
  }

  return { timeout: jobTimedOut, error: jobErrorResult };
}
