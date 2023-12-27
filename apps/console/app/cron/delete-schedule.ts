import { getClient } from "./client";
import { getScheduleId } from "@cront-atlas/workflow";

export async function deleteSchedule({ jobId }: { jobId: string }) {
  const client = await getClient();

  const handle = client.schedule.getHandle(getScheduleId(jobId));
  await handle.delete();

  console.log(`Deleted schedule '${handle.scheduleId}'.`);
}
