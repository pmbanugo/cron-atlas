import { randomBytes, createHmac } from "node:crypto";
import { getEnv } from "./utils";

export function generateApiToken() {
  return `token_${randomBytes(32).toString("base64url")}` as const;
}

export function getApiTokenHash(token: string) {
  const secretKey = getEnv("API_TOKEN_HMAC_SECRET");
  const hmac = createHmac("sha256", secretKey).update(token);
  return hmac.digest("hex");
}
