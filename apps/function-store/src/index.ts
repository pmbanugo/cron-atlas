import { Hono } from "hono";

const app = new Hono<{ Bindings: WorkerEnv }>();

app.get("/", (c) => {
  return c.text("Hello Function Store!");
});

app.post("/", async (c) => {
  const body = await c.req.parseBody<{
    file: File;
    jobId: string;
    userId: string;
  }>();
  const { file, jobId, userId } = body;

  if (typeof file === "string" || file instanceof Array || !jobId || !userId) {
    return c.text("Invalid request", 400);
  }

  const filename = getR2Key({ userId, jobId });
  await c.env.FUNCTION_STORE.put(filename, file);
  return c.text("OK");
});

app.delete("/", async (c) => {
  const body = await c.req.json<{
    jobId: string;
    userId: string;
  }>();
  const { jobId, userId } = body;

  if (!jobId || !userId) {
    return c.text("Invalid request", 400);
  }

  const filename = getR2Key({ userId, jobId });
  await c.env.FUNCTION_STORE.delete(filename);
  return c.text("OK");
});

export default app;

function getR2Key({ userId, jobId }: { userId: string; jobId: string }) {
  return `${userId}/${jobId}`;
}