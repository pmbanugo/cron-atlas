import type { ScheduleSpec, ScheduleUpdateOptions } from "@temporalio/client";
import { getClient } from "./client";
import type { ScheduleType } from "~/data/types";
import { getScheduleId } from "@cron-atlas/workflow";
import type { ScheduledFunctionArgs } from "./common";
import { getScheduleSpecification } from "./common";

export async function updateApiSchedule({
  jobId,
  schedule: { scheduleType, value: scheduleValue },
}: {
  jobId: string;
  schedule: { value: string; scheduleType: ScheduleType };
}) {
  const client = await getClient();
  const scheduleSpec: ScheduleSpec = getScheduleSpecification(
    scheduleType,
    scheduleValue
  );

  const handle = client.schedule.getHandle(
    getScheduleId({ id: jobId, isScheduledFunction: false })
  );
  await handle.update((schedule: ScheduleUpdateOptions) => {
    schedule.spec = scheduleSpec;
    return schedule;
  });

  console.info(`Updated schedule for job'${jobId}'.`);
}

export async function updateFunctionSchedule({
  jobId,
  schedule: { scheduleType, value: scheduleValue },
}: {
  jobId: string;
  schedule: { value: string; scheduleType: ScheduleType };
}) {
  const client = await getClient();
  const scheduleSpec: ScheduleSpec = getScheduleSpecification(
    scheduleType,
    scheduleValue
  );

  const handle = client.schedule.getHandle(
    getScheduleId({ id: jobId, isScheduledFunction: true })
  );
  await handle.update((schedule: ScheduleUpdateOptions) => {
    schedule.spec = scheduleSpec;
    return schedule;
  });

  console.info(`Updated schedule for job'${jobId}'.`);
}

export async function updateScheduledFunctionArgs({
  jobId,
  userId,
  flyAppName,
  runtime,
}: Omit<ScheduledFunctionArgs, "schedule">) {
  const client = await getClient();

  const handle = client.schedule.getHandle(
    getScheduleId({ id: jobId, isScheduledFunction: true })
  );
  await handle.update((schedule: ScheduleUpdateOptions) => {
    schedule.action.args = [{ userId, jobId, flyAppName, runtime }];
    return schedule;
  });

  console.info(`Updated schedule  for job'${jobId}'.`);
}
