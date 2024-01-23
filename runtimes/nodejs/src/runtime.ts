import { request } from "undici";
import { writeFile } from "node:fs/promises";

const fileUrl = process.env["CRONATLAS_FUNCTION_FILE_URL"];
const runId = process.env["CRONATLAS_FUNCTION_RUN_ID"];
if (fileUrl && runId) {
  const url = new URL(fileUrl);
  url.searchParams.set("runId", runId);

  const { statusCode, body } = await request(url);
  if (statusCode !== 200) {
    console.error("failed to fetch function file");
    // TODO: Signal the workflow that to stop, with info that the function couldn't run
    process.exit(1);
  }

  try {
    const filename = "main.js";
    await writeFile(filename, body);
    const { handler } = await import(`../${filename}`);
    handler();
  } catch (error) {
    console.error(error);

    // TODO: Signal the workflow that function run finished, with info that the function threw an error
  }
} else {
  // TODO: Signal the workflow that function run finished, with info that the function couldn't run
  console.error("missing CRONATLAS env vars");
}
