import { Hono } from "hono";
import { isUrlValid } from "./verification";

const app = new Hono<{ Bindings: WorkerEnv }>();

app.get("/", (c) => {
  return c.text("Hello Function Store!");
});

app.post("/", async (c) => {
  const auth = c.req.header("authorization");
  if (auth !== `ApiKey ${c.env.FUNCTION_STORE_API_KEY}`) {
    return c.text("Unauthorized", 401);
  }

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
  const auth = c.req.header("authorization");
  if (auth !== `ApiKey ${c.env.FUNCTION_STORE_API_KEY}`) {
    return c.text("Unauthorized", 401);
  }

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

app.get("/signed/:userId/:jobId", async (c) => {
  if (isUrlValid({ urlString: c.req.url, secret: c.env.R2_SIGNING_SECRET })) {
    const { userId, jobId } = c.req.param();
    const filename = getR2Key({ userId, jobId });
    const file = await c.env.FUNCTION_STORE.get(filename);

    if (file === null) {
      return c.text("Object Not Found", 404);
    }

    const headers = new Headers();
    file.writeHttpMetadata(headers);
    headers.set("etag", file.httpEtag);

    return new Response(file.body, {
      headers,
    });
  }

  return c.text("Invalid request signature", 400);
});

export default app;

function getR2Key({ userId, jobId }: { userId: string; jobId: string }) {
  return `${userId}/${jobId}`;
}
