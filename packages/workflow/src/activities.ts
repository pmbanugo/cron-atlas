import { createHmac } from "node:crypto";
import { Context, activityInfo } from "@temporalio/activity";
import type { CronCallResult } from "./types";
import { createClient } from "fly-admin";
import { ApiMachineRestartPolicyEnum } from "fly-admin/dist/lib/types";
import { MachineState } from "fly-admin/dist/lib/machine";
import { getEnv } from "./config";

export async function callJobApi(url: string): Promise<CronCallResult> {
  Context.current().log.info(`Calling URL ${url}`);
  const timeout = 60 * 1000; // 60 seconds

  const signal = AbortSignal.timeout(timeout);

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      return {
        success: false,
        timeout: false,
        status: response.status,
      };
    }
    return {
      success: true,
      timeout: false,
      status: response.status,
    };
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      Context.current().log.error(
        `Calling job URL ${url} aborted/timedout. Reason: ${
          error.cause ?? error.message
        }`
      );

      return {
        success: false,
        timeout: true,
      };
    }

    error instanceof Error
      ? Context.current().log.error(
          `Calling job URL ${url} failed. Reason: ${error.message}`
        )
      : Context.current().log.error(
          `Calling job URL ${url} failed. Reason: ${JSON.stringify(error)}`
        );

    return {
      success: false,
      timeout: false,
    };
  }
}

let flyClient: ReturnType<typeof createClient> | null = null;

function getFlyClient() {
  if (flyClient) {
    return flyClient;
  }

  const apiToken = getEnv("FLY_API_TOKEN");
  flyClient = createClient(apiToken);
  return flyClient;
}

/** Important: This request can fail, and you’re responsible for handling that failure.
 * If you ask for a large Machine, or a Machine in a region we happen to be at capacity for, you might need to retry the request, or to fall back to another region.
 */
export function createMachine({
  flyAppName,
  userId,
  jobId,
}: {
  flyAppName: string;
  runtimeImage: string;
  userId: string;
  jobId: string;
}) {
  const fly = getFlyClient();
  const runId = activityInfo().workflowExecution.runId;
  const functionFileUrl = createSignedUrl({ userId, jobId, runId });
  return fly.Machine.createMachine({
    app_name: flyAppName,
    config: {
      image: "pmbanugo/cronatlas-nodejs-alpine:amd64",
      auto_destroy: true,
      restart: { policy: ApiMachineRestartPolicyEnum.No },
      guest: { cpu_kind: "shared", cpus: 1, memory_mb: 256 },
      env: {
        CRONATLAS_FUNCTION_FILE_URL: functionFileUrl,
        CRONATLAS_FUNCTION_RUN_ID: runId,
      },
    },
  });
}

export async function deleteMachine({
  id,
  flyAppName,
}: {
  id: string;
  flyAppName: string;
}) {
  const fly = getFlyClient();
  const machine = await fly.Machine.getMachine({
    machine_id: id,
    app_name: flyAppName,
  });

  if (
    machine.state !== MachineState.Destroying &&
    machine.state !== MachineState.Destroyed
  ) {
    const result = await fly.Machine.deleteMachine({
      machine_id: id,
      app_name: flyAppName,
      force: true,
    });
    if (!result.ok) {
      throw new Error(`Failed to delete machine ${id} for app ${flyAppName}`);
    }
  }
}

function createSignedUrl({
  userId,
  jobId,
  runId,
}: {
  userId: string;
  jobId: string;
  runId: string;
}) {
  const runIdKey = "runId";
  const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600; // URL expires in 1 hour
  const secret = getEnv("R2_SIGNING_SECRET");
  const functionDomain = getEnv("FUNCTION_STORE_DOMAIN");

  const url = new URL(`${functionDomain}/signed/${userId}/${jobId}`);
  url.searchParams.set(runIdKey, runId);
  const urlToSign = `${url.pathname}${url.search}`;
  const data = `${expiryTimestamp}${urlToSign}`;

  const signature = createHmac("sha256", secret).update(data).digest("hex");

  url.searchParams.set("expires", expiryTimestamp.toString());
  url.searchParams.set("signature", signature);
  url.searchParams.delete(runIdKey);

  return url.toString();
}
