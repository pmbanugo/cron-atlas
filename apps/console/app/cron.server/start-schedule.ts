import type { ScheduleSpec } from "@temporalio/client";
import { ScheduleOverlapPolicy } from "@temporalio/client";
import {
  triggerJob,
  constants,
  getScheduleId,
  runScheduledFunction,
} from "@cron-atlas/workflow";
import { getClient } from "./client";
import type { ScheduleType } from "~/data/types";
import type { ScheduledFunctionArgs } from "./common";
import { getScheduleSpecification } from "./common";

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
  runtime,
  schedule: { scheduleType, value: scheduleValue },
}: ScheduledFunctionArgs) {
  const client = await getClient();

  const scheduleSpec: ScheduleSpec = getScheduleSpecification(
    scheduleType,
    scheduleValue
  );

  await client.schedule.create({
    action: {
      type: "startWorkflow",
      workflowType: runScheduledFunction,
      args: [{ userId, jobId, flyAppName, runtime }],
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
