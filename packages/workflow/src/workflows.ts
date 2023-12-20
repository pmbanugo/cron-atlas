import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";
import type { CronCallResult } from "./types";

const { callJobApi } = proxyActivities<typeof activities>({
  startToCloseTimeout: "2 minutes",
  retry: {
    maximumAttempts: 1,
  },
});

export async function triggerJob({
  url,
}: {
  url: string;
}): Promise<CronCallResult> {
  return await callJobApi(url);
}
