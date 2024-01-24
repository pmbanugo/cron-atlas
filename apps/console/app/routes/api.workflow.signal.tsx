import type { ActionFunctionArgs } from "@remix-run/node";
import { object, string, optional, parse, ValiError } from "valibot";
import { signalJobFinished } from "~/cron/signal";

const SignalSchema = object({
  runId: string(),
  machineId: string(),
  workflowId: string(),
  error: optional(object({ message: string() })),
});

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  try {
    const signal = parse(SignalSchema, body);
    await signalJobFinished(signal);
    return new Response("OK");
  } catch (error) {
    console.error(error);
    if (error instanceof ValiError) {
      return new Response("Invalid Request Body", { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
