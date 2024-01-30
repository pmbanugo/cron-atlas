export type RemoteJobResult = {
  success: boolean;
  timeout: boolean;
  status?: number;
};

export type ScheduledFunctionResult = {
  timeout: boolean;
  error?: { message: string; stack?: string };
};
