import { ApplicationFailure } from "@temporalio/activity";

export const constants = {
  QUEUE: process.env.TEMPORAL_QUEUE || "cron-jobs",
  NAMESPACE: process.env.TEMPORAL_NAMESPACE || "default",
};

export type ENV_KEYS =
  | "TEMPORAL_QUEUE"
  | "TEMPORAL_NAMESPACE"
  | "FLY_API_TOKEN"
  | "R2_SIGNING_SECRET"
  | "FUNCTION_STORE_DOMAIN";

export function getScheduleId({
  isScheduledFunction,
  id,
}: {
  id: string;
  isScheduledFunction: boolean;
}) {
  if (isScheduledFunction) {
    return `scheduled-function-${id}` as const;
  }
  return `cronjob-${id}` as const;
}

export function getEnv(key: ENV_KEYS) {
  return process.env[key] ?? raiseError(`env ${key} not set`);
}

function raiseError(message: string): never {
  throw new ApplicationFailure(message, "ENV_NOT_SET", true);
}
