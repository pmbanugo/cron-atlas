import type { Job } from "~/data/schema";
import { getEnv, getFlyAppName } from "~/lib/utils";
import { updateScheduledFunctionArgs } from "~/cron.server/update-schedule";
import type { Output } from "valibot";
import { updateScheduledFunctionConfig as updateDbScheduledFunctionConfig } from "~/data/respository.server";
import type { FunctionFileUploadInputSchema } from "../schema";

export async function updateScheduledFunction({
  jobId,
  userId,
  data,
  currentFunctionConfig,
}: {
  jobId: string;
  userId: string;
  currentFunctionConfig?: Job["functionConfig"];
  data: Output<typeof FunctionFileUploadInputSchema>;
}) {
  const functionStoreUrl = getEnv("FUNCTION_STORE_DOMAIN");

  const funcStoreFormData = new FormData();
  funcStoreFormData.append("userId", userId);
  funcStoreFormData.append("jobId", jobId);
  funcStoreFormData.append("file", data.file);
  const uploadResponse = await fetch(functionStoreUrl, {
    method: "POST",
    body: funcStoreFormData,
    headers: {
      Authorization: `ApiKey ${process.env.FUNCTION_STORE_API_KEY}`,
    },
  });

  if (!uploadResponse.ok) {
    throw new Response("Error uploading function file", { status: 500 });
  }

  // Update the runtime if it has changed
  if (currentFunctionConfig?.runtime !== data.runtime) {
    const [temporalScheduleUpdate, dbUpdate] = await Promise.allSettled([
      updateScheduledFunctionArgs({
        jobId,
        runtime: data.runtime,
        userId,
        flyAppName: getFlyAppName(jobId),
      }),
      updateDbScheduledFunctionConfig({
        jobId,
        userId,
        functionConfig: {
          ...currentFunctionConfig,
          runtime: data.runtime,
        },
      }),
    ]);

    if (temporalScheduleUpdate.status === "rejected") {
      console.error({
        message: `Error updating temporal schedule for jobId ${jobId}`,
        reason: temporalScheduleUpdate.reason,
        level: "error",
      });
      throw new Response(
        "Error updating runtime after successfully saving function file",
        { status: 500 }
      );
    }

    if (dbUpdate.status === "rejected") {
      console.error({
        message: `Error updating db for jobId ${jobId}`,
        reason: dbUpdate.reason,
        level: "error",
      });
      throw new Response(
        "Error updating job config, after successfully saving function file",
        { status: 500 }
      );
    }
  }
}
