import { getClient } from "./client";
import { getScheduleId } from "@cron-atlas/workflow";

export async function deleteSchedule({
  jobId,
  isScheduledFunction,
}: {
  jobId: string;
  isScheduledFunction: boolean;
}) {
  const client = await getClient();

  const handle = client.schedule.getHandle(
    getScheduleId({ id: jobId, isScheduledFunction })
  );
  await handle.delete();
  console.info(`Deleted schedule '${handle.scheduleId}'.`);
}
