import type { LoaderFunctionArgs } from "@remix-run/node";
import { buildDbClient } from "~/data/db";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    buildDbClient();
    return new Response("OK");
  } catch (error: unknown) {
    console.error(request.url, "healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
