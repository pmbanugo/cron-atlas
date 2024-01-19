import type { ScheduleSpec } from "@temporalio/client";
import { MONTHS, ScheduleOverlapPolicy } from "@temporalio/client";
import {
  triggerJob,
  constants,
  getScheduleId,
  runScheduledFunction,
} from "@cron-atlas/workflow";
import { getClient } from "./client";
import type { ScheduleType } from "~/data/types";

export async function startApiSchedule({
  jobId,
  url,
  schedule: { scheduleType, value: scheduleValue },
}: {
  jobId: string;
  url: string;
  schedule: { value: string; scheduleType: ScheduleType };
}) {
  const client = await getClient();
  const spec: ScheduleSpec = getScheduleSpecification(
    scheduleType,
    scheduleValue
  );

  const schedule = await client.schedule.create({
    action: {
      type: "startWorkflow",
      workflowType: triggerJob,
      args: [{ url }],
      taskQueue: constants.QUEUE,
    },
    scheduleId: getScheduleId({ id: jobId, isScheduledFunction: false }),
    policies: {
      catchupWindow: "1 day",
      overlap: ScheduleOverlapPolicy.SKIP,
    },
    spec: spec,
  });

  console.info(`Started schedule '${schedule.scheduleId}'.`);
}

export async function startScheduledFunction({
  jobId,
  userId,
  flyAppName,
  runtimeImage,
  schedule: { scheduleType, value: scheduleValue },
}: {
  jobId: string;
  userId: string;
  flyAppName: string;
  runtimeImage: string;
  schedule: { value: string; scheduleType: ScheduleType };
}) {
  const client = await getClient();

  const scheduleSpec: ScheduleSpec = getScheduleSpecification(
    scheduleType,
    scheduleValue
  );

  await client.schedule.create({
    action: {
      type: "startWorkflow",
      workflowType: runScheduledFunction,
      args: [{ userId, jobId, flyAppName, runtimeImage }],
      taskQueue: constants.QUEUE,
    },
    scheduleId: getScheduleId({ id: jobId, isScheduledFunction: true }),
    policies: {
      catchupWindow: "1 day",
      overlap: ScheduleOverlapPolicy.SKIP,
    },
    spec: scheduleSpec,
  });
}

function getScheduleSpecification(
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
