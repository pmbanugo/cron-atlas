import { randomBytes, createHmac } from "node:crypto";
import { getEnv } from "./utils";
import { getApiToken } from "~/data/respository.server";

export function generateApiToken() {
  return `token_${randomBytes(32).toString("base64url")}` as const;
}

export function getApiTokenHash(token: string) {
  const secretKey = getEnv("API_TOKEN_HMAC_SECRET");
  const hmac = createHmac("sha256", secretKey).update(token);
  return hmac.digest("hex");
}

export async function requireUserId(request: Request) {
  const requestToken = request.headers.get("authentication");
  if (!requestToken) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const hashedToken = getApiTokenHash(requestToken.replace("Bearer ", ""));
  const apiToken = await getApiToken(hashedToken);
  if (!apiToken) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return apiToken.userId;
}
