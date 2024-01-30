import { request } from "undici";
import { writeFile } from "node:fs/promises";

const fileUrl = process.env["CRONATLAS_FUNCTION_FILE_URL"];
const runId = process.env["CRONATLAS_FUNCTION_RUN_ID"];
if (fileUrl && runId) {
  const url = new URL(fileUrl);
  url.searchParams.set("runId", runId);
  try {
    const { statusCode, body } = await request(url);
    if (statusCode !== 200) {
      console.error("failed to fetch function file");
      await sendSignal({
        error: { message: "internal error: failed to fetch function file" },
      });
      process.exit(1);
    }

    const filename = "main.js";
    await writeFile(filename, body);
    const { handler } = await import(`../${filename}`);
    await handler();
    await sendSignal();
  } catch (error) {
    console.error(error);

    if (typeof error === "string") {
      await sendSignal({ error: { message: error } });
    }
    await sendSignal({
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
} else {
  console.error("missing CRONATLAS environment variables");
  await sendSignal({
    error: { message: "missing CRONATLAS environment variables" },
  });
}

async function sendSignal(input?: {
  error?: { message: string; stack?: string };
}) {
  const signalUrl = process.env["CRONATLAS_WORKFLOW_SIGNAL_URL"];
  if (signalUrl) {
    await request(signalUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        runId: process.env["CRONATLAS_FUNCTION_RUN_ID"],
        workflowId: process.env["CRONATLAS_FUNCTION_WORKFLOW_ID"],
        machineId: process.env["FLY_MACHINE_ID"],
        error: input?.error,
      }),
    });
    console.info("sent signal");
  }
}
