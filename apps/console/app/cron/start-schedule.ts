import type { ScheduleSpec } from "@temporalio/client";
import { MONTHS, ScheduleOverlapPolicy } from "@temporalio/client";
import { triggerJob, constants, getScheduleId } from "@cront-atlas/workflow";
import { getClient } from "./client";
import type { ScheduleType } from "~/data/types";

export async function start({
  jobId,
  url,
  schedule: { scheduleType, value: scheduleValue },
}: {
  jobId: string;
  url: string;
  schedule: { value: string; scheduleType: ScheduleType };
}) {
  const client = await getClient();

  let spec: ScheduleSpec;
  switch (scheduleType) {
    case "interval":
      spec = {
        intervals: [{ every: scheduleValue }],
      };
      break;
    case "cron":
      spec = {
        cronExpressions: [scheduleValue],
      };
      break;
    case "once":
      const date = new Date(scheduleValue);
      spec = {
        calendars: [
          {
            //Might be better not to use UTC time and justspecify the IANA timezone used for the schedule
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
      break;
    default:
      throw new Error("Invalid schedule type");
  }

  // https://typescript.temporal.io/api/classes/client.ScheduleClient#create
  const schedule = await client.schedule.create({
    action: {
      type: "startWorkflow",
      workflowType: triggerJob,
      args: [{ url }],
      taskQueue: constants.QUEUE,
    },
    scheduleId: getScheduleId(jobId),
    policies: {
      catchupWindow: "1 day",
      overlap: ScheduleOverlapPolicy.CANCEL_OTHER,
    },
    spec: spec,
  });

  console.log(`Started schedule '${schedule.scheduleId}'.`);
}
