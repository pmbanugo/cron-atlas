import { Context } from "@temporalio/activity";
import type { CronCallResult } from "./types";
import { createClient } from "fly-admin";
import { ApiMachineRestartPolicyEnum } from "fly-admin/dist/lib/types";
import { MachineState } from "fly-admin/dist/lib/machine";

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

function raiseError(message: string): never {
  throw new Error(message);
}

function getFlyClient() {
  if (flyClient) {
    return flyClient;
  }

  const apiToken =
    process.env.FLY_API_TOKEN ?? raiseError("FLY_API_TOKEN not set");
  flyClient = createClient(apiToken);
  return flyClient;
}

/** Important: This request can fail, and you’re responsible for handling that failure.
 * If you ask for a large Machine, or a Machine in a region we happen to be at capacity for, you might need to retry the request, or to fall back to another region.
 */
export function createMachine({
  flyAppName,
}: {
  flyAppName: string;
  runtimeImage: string;
}) {
  const fly = getFlyClient();
  return fly.Machine.createMachine({
    app_name: flyAppName,
    config: {
      // TODO: remove init once we have a proper runtime image
      init: {
        exec: ["/bin/sleep", "inf"],
      },
      image: "registry-1.docker.io/library/ubuntu:latest",
      auto_destroy: true,
      restart: { policy: ApiMachineRestartPolicyEnum.No },
      // guest: { cpu_kind: "shared", cpus: 1, memory_mb: 256 },
      // env: {},
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
