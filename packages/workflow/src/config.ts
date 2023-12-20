export const constants = {
  QUEUE: process.env.TEMPORAL_QUEUE || "cron-jobs",
  NAMESPACE: process.env.TEMPORAL_NAMESPACE || "default",
};

export function getScheduleId(id: string) {
  return `cronjob-${id}` as const;
}
