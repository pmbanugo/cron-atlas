import { ApplicationFailure } from "@temporalio/activity";
import type { FunctionRuntime } from "./types";

//TODO: move to constants.ts and rename variable
export const constants = {
  QUEUE: process.env.TEMPORAL_QUEUE || "cron-jobs",
  NAMESPACE: process.env.TEMPORAL_NAMESPACE || "default",
};

export type ENV_KEYS =
  | "TEMPORAL_QUEUE"
  | "TEMPORAL_NAMESPACE"
  | "FLY_API_TOKEN"
  | "R2_SIGNING_SECRET"
  | "FUNCTION_STORE_DOMAIN"
  | "WORKFLOW_SIGNAL_URL"
  | "WORKFLOW_SIGNAL_SIGNING_SECRET";

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

export const RUNTIME_IMAGE = {
  "nodejs-alpine":
    "registry.fly.io/cronatlas-nodejs-alpine:deployment-01HNWTP9KDXR2BT4PH2YEMYY7Y", //140MB
  "nodejs-debian":
    "registry.fly.io/cronatlas-nodejs-slim:deployment-01HNWTPKQKT34VJSQBH1SFZ77K", // 204MB
  "bun-alpine":
    "registry.fly.io/cronatlas-bun-alpine:deployment-01HNWTWCX7MFYDBB7075SG10BN", // 177MB
  "bun-debian":
    "registry.fly.io/cronatlas-bun-slim:deployment-01HNWTX1NBJJP0C8Y5DDSZG3M7", // 240MB
} as const satisfies Record<FunctionRuntime, string>;

export function getEnv(key: ENV_KEYS) {
  return process.env[key] ?? raiseError(`env ${key} not set`);
}

function raiseError(message: string): never {
  throw new ApplicationFailure(message, "ENV_NOT_SET", true);
}
