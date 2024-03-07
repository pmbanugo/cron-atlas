import type { FUNCTION_RUNTIME_OPTIONS } from "./constant";

export type RemoteJobResult = {
  success: boolean;
  timeout: boolean;
  status?: number;
};

export type ScheduledFunctionResult = {
  timeout: boolean;
  error?: { message: string; stack?: string };
};

export type FunctionRuntime = (typeof FUNCTION_RUNTIME_OPTIONS)[number];
