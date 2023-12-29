import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSessionManager } from "~/lib/session.server";

export const action = async ({ request }: ActionFunctionArgs) =>
  await getSessionManager().logout(request);

export const loader = () => redirect("/");
