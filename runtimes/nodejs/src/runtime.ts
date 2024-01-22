import { request } from "undici";
import { writeFile } from "node:fs/promises";

const {
  statusCode,

  body,
} = await request("http://localhost:8787/get");

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

  // TODO: Signal the workflow that to stop, with info that the function threw an error
}
