import { WorkOS } from "@workos-inc/node";
import { raiseError } from "./utils";

export function getAuthorizationUrl(redirectTo?: string) {
  const workos = new WorkOS(
    process.env.WORKOS_API_KEY ?? raiseError("Missing WORKOS_API_KEY")
  );
  const clientId =
    process.env.WORKOS_CLIENT_ID ?? raiseError("Missing WORKOS_CLIENT_ID");
  const redirectUri =
    process.env.AUTH_REDIRECT_URI || "https://cronatlas.dev/auth/callback";

  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    // Specify that we'd like AuthKit to handle the authentication flow
    provider: "authkit",
    redirectUri: redirectUri,
    clientId,
    state: redirectTo,
  });

  return authorizationUrl;
}
