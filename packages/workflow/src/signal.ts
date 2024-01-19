import { defineSignal } from "@temporalio/workflow";

export interface JobFinishedInput {
  runId: string;
  workflowId: string;
  machineId: string;
}

export const jobFinishedSignal =
  defineSignal<[JobFinishedInput]>("job_finished");
