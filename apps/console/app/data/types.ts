export const SCHEDULE_TYPES = {
  interval: "interval",
  cron: "cron",
  once: "once",
} as const;

export type ScheduleType = keyof typeof SCHEDULE_TYPES;

export type JobType = "url" | "function";

export type FunctionRuntime =
  | "nodejs-alpine"
  | "nodejs-debian"
  | "bun-alpine"
  | "bun-debian";
