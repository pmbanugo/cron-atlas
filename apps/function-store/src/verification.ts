// TODO: remove this ts-ignore once there's proper typing for this. https://github.com/cloudflare/workers-sdk/discussions/4822#discussioncomment-8224050
//@ts-ignore
import { createHmac } from "node:crypto";
/**
 * Check if the signed URL is valid or not
 * @param urlString URL to be checked
 * @param secret Secret key for signing
 * @returns true if the URL is valid, false otherwise
 */
export function isUrlValid({
  urlString,
  secret,
}: {
  urlString: string;
  secret: string;
}): boolean {
  const url: URL = new URL(urlString);

  const urlSignature = url.searchParams.get("signature");
  const urlExpiryTime = url.searchParams.get("expires");
  const runId = url.searchParams.get("runId");

  if (!urlSignature || !urlExpiryTime || !runId) {
    return false;
  }

  // remove 'signature' & 'expires' parameter before checking the signature again
  url.searchParams.delete("signature");
  url.searchParams.delete("expires");
  const urlToSign = `${url.pathname}${url.search}`;

  // check if the URL has expired
  if (parseInt(urlExpiryTime) < Math.floor(Date.now() / 1000)) {
    return false;
  }

  // check the signature
  const data = `${urlExpiryTime}${urlToSign}`;
  const expectedSignature: string = createHmac("sha256", secret)
    .update(data)
    .digest("hex");
  return urlSignature === expectedSignature;
}
