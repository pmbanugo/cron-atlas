export const SCHEDULE_TYPES = ["interval", "cron", "once"] as const;

export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

export const JOB_TYPES = ["url", "function"] as const;

export type JobType = (typeof JOB_TYPES)[number];
