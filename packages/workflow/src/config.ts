export const constants = {
  QUEUE: process.env.TEMPORAL_QUEUE || "cron-jobs",
  NAMESPACE: process.env.TEMPORAL_NAMESPACE || "default",
};

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
