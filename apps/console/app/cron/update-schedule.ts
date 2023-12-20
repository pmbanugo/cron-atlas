import type { ScheduleSpec, ScheduleUpdateOptions } from "@temporalio/client";
import { MONTHS } from "@temporalio/client";
import { getClient } from "./client";
import type { ScheduleType } from "~/data/types";
import { getScheduleId } from "@cront-atlas/workflow";

export async function update({
  jobId,
  schedule: { scheduleType, value: scheduleValue },
}: {
  jobId: string;
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

  const handle = client.schedule.getHandle(getScheduleId(jobId));
  await handle.update((schedule: ScheduleUpdateOptions) => {
    schedule.spec = spec;
    return schedule;
  });

  console.log(`Updated schedule '${handle.scheduleId}'.`);

  //TODO: Do we need to close the connection? or can we keep it open forever?
  // await client.connection.close();
}
