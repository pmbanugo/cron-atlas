import { Context } from "@temporalio/activity";
import type { CronCallResult } from "./types";

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
