import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/lib/api.server";
import { saveJob } from "./logic.server";
import { formatJobForAPI } from "../dto-schema/transform";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  if (
    request.headers.get("Content-Type") === "application/json" &&
    request.method === "POST"
  ) {
    const requestData = await request.json();
    const job = await saveJob({ userId, data: requestData });
    if (!job) {
      return new Response("Couldn't create job", { status: 500 });
    }

    return json(formatJobForAPI(job));
  }

  return new Response("No handler for this request path/method", {
    status: 400,
  });
}
