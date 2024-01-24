import type { JobFinishedInput } from "@cron-atlas/workflow";
import { jobFinishedSignal } from "@cron-atlas/workflow";
import { getClient } from "./client";

export async function signalJobFinished(signalInput: JobFinishedInput) {
  const client = await getClient();
  const handle = client.workflow.getHandle(
    signalInput.workflowId,
    signalInput.runId
  );

  await handle.signal(jobFinishedSignal, signalInput);
}
