import type { LoaderFunctionArgs } from "@remix-run/node";
import { getDbClient } from "~/data/db";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    getDbClient();
    return new Response("OK");
  } catch (error: unknown) {
    console.error(request.url, "healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
