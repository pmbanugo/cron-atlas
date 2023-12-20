import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { WorkOS } from "@workos-inc/node";
import { eq } from "drizzle-orm";
import { buildDbClient } from "~/data/db";
import { users } from "~/data/schema";
import { getSessionManager } from "~/lib/session.server";
import { raiseError } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const workos = new WorkOS(
    process.env.WORKOS_API_KEY ?? raiseError("Missing WORKOS_API_KEY")
  );
  const clientId =
    process.env.WORKOS_CLIENT_ID ?? raiseError("Missing WORKOS_CLIENT_ID");

  // The authorization code returned by AuthKit
  const url = new URL(request.url);
  const code =
    url.searchParams.get("code") ??
    raiseError("Missing code from AuthKit callback");

  const { user } = await workos.userManagement.authenticateWithCode({
    code,
    clientId,
  });

  try {
    const sessionManager = getSessionManager();
    const db = buildDbClient();
    const existingUser = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.id, user.id),
    });

    if (!existingUser) {
      await db.insert(users).values({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }

    return sessionManager.createUserSession({
      userId: user.id,
      firstName: user.firstName,
      email: user.email,
      redirectTo: url.searchParams.get("state") ?? undefined,
    });
  } catch (error) {
    console.error("LoginError: \n", error);
    return redirect(`/500`, { status: 500 });
  }
}
