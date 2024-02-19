import { randomBytes, createHmac } from "node:crypto";

export function generateApiToken() {
  return `token_${randomBytes(32).toString("base64url")}` as const;
}

export function getApiTokenHash({
  token,
  secretKey,
}: {
  token: string;
  secretKey: string;
}) {
  const hmac = createHmac("sha256", secretKey).update(token);
  return hmac.digest("hex");
}
