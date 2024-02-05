import type { FunctionRuntime } from "@cron-atlas/workflow";
import type { ScheduleSpec } from "@temporalio/client";
import { MONTHS } from "@temporalio/client";
import type { ScheduleType } from "~/data/types";

export type ScheduledFunctionArgs = {
  jobId: string;
  userId: string;
  flyAppName: string;
  runtime: FunctionRuntime;
  schedule: {
    value: string;
    scheduleType: ScheduleType;
  };
};

export function getScheduleSpecification(
  scheduleType: string,
  scheduleValue: string
): ScheduleSpec {
  switch (scheduleType) {
    case "interval":
      return {
        intervals: [{ every: scheduleValue }],
      };
    case "cron":
      return {
        cronExpressions: [scheduleValue],
      };
    case "once":
      const date = new Date(scheduleValue);
      return {
        calendars: [
          {
            //Might be better not to use UTC time and just specify the IANA timezone used for the schedule
            comment: `once at ${scheduleValue}`,
            year: date.getUTCFullYear(),
            month: MONTHS[date.getUTCMonth()],
            dayOfMonth: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            second: date.getUTCSeconds(),
          },
        ],
      };
    default:
      throw new Error("Invalid schedule type");
  }
}
