import { defineSignal } from "@temporalio/workflow";

export interface JobFinishedInput {
  runId: string;
  workflowId: string;
  machineId: string;
  error?: { message: string };
}

export const jobFinishedSignal =
  defineSignal<[JobFinishedInput]>("job_finished");
