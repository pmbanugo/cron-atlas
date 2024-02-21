import { ScheduleNotFoundError } from "@temporalio/client";
import { getClient } from "./client";
import type {
  RemoteJobResult,
  ScheduledFunctionResult,
} from "@cron-atlas/workflow";
import { getScheduleId } from "@cron-atlas/workflow";

export async function getRecent({
  jobId,
  isScheduledFunction,
}: {
  jobId: string;
  isScheduledFunction: boolean;
}) {
  const client = await getClient();

  try {
    const handle = client.schedule.getHandle(
      getScheduleId({ id: jobId, isScheduledFunction })
    );
    const scheduledescription = await handle.describe();
    const recentActionsWorkflowId = scheduledescription.info.recentActions
      .reverse()
      .slice(0, 5)
      .map(({ action, takenAt }) => ({
        workflowId: action.workflow.workflowId,
        takenAt,
      }));

    const workflowResults = await Promise.all(
      recentActionsWorkflowId
        .map(
          ({ workflowId }) =>
            client.workflow.getHandle(workflowId).result() as Promise<
              RemoteJobResult | ScheduledFunctionResult
            >
        )
        .filter(Boolean)
    );

    return {
      paused: scheduledescription.state.paused,
      totalActions: scheduledescription.info.numActionsTaken,
      recentActions: recentActionsWorkflowId.map((recentAction, index) => ({
        ...recentAction,
        takenAt: recentAction.takenAt.toLocaleString("en-US"),
        result: workflowResults[index],
      })),
    };
  } catch (error) {
    if (error instanceof ScheduleNotFoundError) {
      console.error(`Schedule for job with ID '${jobId}' not found`);
    }
    return null;
  }

  //TODO: Do we need to close the connection? or can we keep it open forever?
  // await client.connection.close();
}
