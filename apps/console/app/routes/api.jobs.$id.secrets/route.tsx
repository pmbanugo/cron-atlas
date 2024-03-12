import { json, type ActionFunctionArgs } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { getDbClient } from "~/data/db";
import type { Job } from "~/data/schema";
import { jobs } from "~/data/schema";
import { requireUserId } from "~/lib/api.server";
import { createClient } from "fly-admin";
import { getEnv, getFlyAppName } from "~/lib/utils";
import { updateScheduledFunctionConfig } from "~/data/respository.server";
import { safeParse } from "valibot";
import { SecretsInputSchema } from "../dto-schema";

export async function action({ request, params }: ActionFunctionArgs) {
  const jobId = params.id;
  if (!jobId) {
    return new Response("Job Id is required in path", { status: 400 });
  }
  const userId = await requireUserId(request);

  const db = getDbClient();
  const job = await db.query.jobs.findFirst({
    columns: { id: true, jobType: true, functionConfig: true },
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  });

  if (!job || job.jobType !== "function") {
    return new Response("Job not found", { status: 404 });
  }
  if (!job.functionConfig) {
    return new Response(
      "The job's Function config is in an invalid state, therefore, can't update job. Please contact support",
      { status: 500 }
    );
  }

  switch (request.method) {
    case "DELETE": {
      if (
        job.functionConfig.secrets === undefined ||
        job.functionConfig.secrets.length === 0
      ) {
        return new Response("No secrets to delete", { status: 200 });
      }

      const payload = await request
        .json()
        .catch(() =>
          console.warn({ message: "Error parsing JSON Payload", level: "info" })
        );

      if (!payload || !Array.isArray(payload) || payload.length === 0) {
        return new Response("Invalid JSON Payload", { status: 400 });
      }

      const keysToDelete = payload.filter((key) => typeof key === "string");
      if (keysToDelete.length === 0) {
        return new Response("Invalid JSON Payload", { status: 400 });
      }

      const flyClient = createClient(getEnv("FLY_API_TOKEN"));
      try {
        await flyClient.Secret.unsetSecrets({
          appId: getFlyAppName(jobId),
          keys: keysToDelete,
        });

        const newFunctionConfig: Job["functionConfig"] = {
          ...job.functionConfig,
          secrets: job.functionConfig.secrets.filter(
            (secret) => !keysToDelete.includes(secret)
          ),
        };

        await updateScheduledFunctionConfig({
          jobId,
          userId,
          functionConfig: newFunctionConfig,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error({
            message: error.message,
            reason: error.cause,
            level: "error",
          });
        }
        return new Response("Error deleting secrets", { status: 500 });
      }

      return new Response("Secrets Deleted", { status: 200 });
    }
    case "POST": {
      const payload = await request.json();
      const validationResult = safeParse(SecretsInputSchema, payload);
      if (validationResult.success) {
        const secrets = validationResult.output;
        const flyClient = createClient(getEnv("FLY_API_TOKEN"));

        const secretKeys = new Set(
          secrets
            .map((secret) => secret.key)
            .concat(job.functionConfig.secrets ?? [])
        );

        try {
          await flyClient.Secret.setSecrets({
            appId: getFlyAppName(jobId),
            secrets,
          });

          const newFunctionConfig: Job["functionConfig"] = {
            ...job.functionConfig,
            secrets: Array.from(secretKeys),
          };

          await updateScheduledFunctionConfig({
            jobId,
            userId,
            functionConfig: newFunctionConfig,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error({
              message: error.message,
              reason: error.cause,
              level: "error",
            });
          }
          return new Response("Error updating secrets", { status: 500 });
        }

        return new Response("Secrets Updated", { status: 200 });
      }

      return json(validationResult.issues, 400);
    }
    default:
      return new Response("No handler for this request path or method", {
        status: 400,
      });
  }
}
