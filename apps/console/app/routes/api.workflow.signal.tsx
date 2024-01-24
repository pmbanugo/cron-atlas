import { createHmac } from "node:crypto";
import type { ActionFunctionArgs } from "@remix-run/node";
import { object, string, optional, parse, ValiError } from "valibot";
import { signalJobFinished } from "~/cron/signal";
import { raiseError } from "~/lib/utils";

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
    if (
      !isSignedUrlValid({
        urlString: request.url,
        secret:
          process.env.WORKFLOW_SIGNAL_SIGNING_SECRET ||
          raiseError("WORKFLOW_SIGNAL_SIGNING_SECRET is not set"),
        runId: signal.runId,
        workflowId: signal.workflowId,
      })
    ) {
      return new Response("Invalid Signature", { status: 401 });
    }

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

export function isSignedUrlValid({
  urlString,
  secret,
  runId,
  workflowId,
}: {
  urlString: string;
  runId: string;
  workflowId: string;
  secret: string;
}): boolean {
  const url: URL = new URL(urlString);

  const urlSignature = url.searchParams.get("signature");
  const urlExpiryTime = url.searchParams.get("expires");

  if (!urlSignature || !urlExpiryTime) {
    return false;
  }

  // remove 'signature' & 'expires' parameter before checking the signature again
  url.searchParams.delete("signature");
  url.searchParams.delete("expires");

  // check if the URL has expired
  if (parseInt(urlExpiryTime) < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const data = `${urlExpiryTime}${url.pathname}${runId}${workflowId}`;
  const expectedSignature: string = createHmac("sha256", secret)
    .update(data)
    .digest("hex");
  return urlSignature === expectedSignature;
}
